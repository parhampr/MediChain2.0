"use strict";
const { Contract } = require("fabric-contract-api");
const stringify = require("json-stringify-deterministic");
const sortKeysRecursive = require("sort-keys-recursive");
const { getTypeEHROrDoctor } = require("./Models/ehr.model.js");
const ClientIdentity = require("fabric-shim").ClientIdentity;
const indexedOrgForPatients = "orgDetails~PID";
const indexedOrgForDoctors = "orgDetails~DID";

class FabCar extends Contract {
  async initLedger(ctx) {
    console.info("============= START : Initialize Ledger ===========");
    console.info("============= PROCESS : NOTHING TO DO ===========");
    console.info("============= END : Initialize Ledger ===========");
  }

  /**
   *
   * @param {TxContext} ctx
   * @param {String} PID - Patient ID
   * @param {String} ptDetails - Patient Details
   * @param {String} orgDtails - orgID, orgName, orgAdd
   * @param {String} contact - mobile, other, whatsapp
   * This function adds a patient to the hospital. - [INSERTION]
   * USE SubmitTransaction for this rather than evaluate
   */

  async checkIfPatientExists(ctx, PID, org) {
    const member = await ctx.stub.getState(PID);
    if (!member || member.length === 0)
      throw new Error(`The patient with given ID does not exists`);
    const pt = JSON.parse(member.toString());
    if (pt.orgDetails.org !== `${org.toUpperCase()}MSP`)
      throw new Error(`The patient with given ID is not associated to given hospital`);
  }

  async addPatientEHR(ctx, PID, ptDetails, address, contact) {
    const member = await ctx.stub.getState(PID);
    if (member && member.length !== 0)
      throw new Error(`The patient with given ID already exists`);
    let orgDetails = JSON.parse(this.getOrganizationDetails(ctx));
    if (!orgDetails)
      throw new Error("This is not valid transaction, please try again later");
    const content = getTypeEHROrDoctor(
      JSON.parse(ptDetails),
      orgDetails,
      JSON.parse(address),
      JSON.parse(contact),
      "Patient"
    );
    await ctx.stub.putState(
      PID,
      Buffer.from(
        stringify(
          sortKeysRecursive({
            ...content,
            checkIn: [],
            checkOut: [],
            active: "Not Patients"
          })
        )
      )
    );
    console.log("Putstate Done...Now indexing");
    await this.createOrgIndex(ctx, PID, orgDetails.org.toString(), indexedOrgForPatients);
    return JSON.stringify(content);
  }

  /**
   *
   * @param {TxContext} ctx
   * @param {String} DID - Doctor ID
   * @param {String} docDetails - Doctor Personal Details
   * @param {String} contact - mobile, other, whatsapp
   * This function adds a new doctor to the organization - [INSERTION]
   * USE SubmitTransaction for this rather than evaluate
   */
  async addDoctor(ctx, DID, docDetails, address, contact) {
    const member = await ctx.stub.getState(DID);
    if (member && member.length !== 0)
      throw new Error(`The doctor with ${DID} already exists`);
    let orgDetails = JSON.parse(this.getOrganizationDetails(ctx));
    if (!orgDetails)
      throw new Error("This is not valid transaction, please try again later");
    docDetails = JSON.parse(docDetails);
    const content = getTypeEHROrDoctor(
      docDetails,
      orgDetails,
      JSON.parse(address),
      JSON.parse(contact),
      "Doctor"
    );
    await ctx.stub.putState(
      DID,
      Buffer.from(
        stringify(sortKeysRecursive({ ...content, active: ["Active", "Unoccupied"] }))
      )
    );
    await this.createOrgIndex(ctx, DID, orgDetails.org.toString(), indexedOrgForDoctors);
    return JSON.stringify(content);
  }

  async checkInPatient(ctx, PID, timeStamp) {
    let [type, patient] = await this.getMemberType(ctx, PID);
    if (
      type !== "Admin" ||
      !JSON.parse(patient).orgDetails.role.toLowerCase().includes("patient")
    )
      throw new Error(
        "The patient identity does not exist or you are trying to access the unauthorized area"
      );
    patient = JSON.parse(patient);
    if (patient.checkIn.length === patient.checkOut.length) {
      patient.checkIn.push(
        parseInt(timeStamp) !== 0
          ? parseInt(timeStamp)
          : this.toDate(ctx.stub.getTxTimestamp())
      );
      patient.active = this.getStatus(
        patient.checkIn,
        patient.checkOut,
        patient.associatedDoctors
      );
      await ctx.stub.putState(PID, Buffer.from(stringify(patient)));
    } else
      throw new Error(
        "The patient is already checked in. Please checkout the patient and try again."
      );
  }

  async dischargePatientForDoctor(ctx, DOCID, PID, Note) {
    let [doctype, patient] = await this.getMemberType(ctx, PID);
    if (
      doctype !== "Doctor" ||
      !JSON.parse(patient.toString())
        .orgDetails.role.toString()
        .toLowerCase()
        .includes("patient")
    )
      throw new Error("Patient can only be discharged to an in-hospital doctor");
    patient = JSON.parse(patient.toString());
    let doctor = JSON.parse((await ctx.stub.getState(DOCID)).toString());
    let isTotalDischarge = true;

    patient.associatedDoctors[DOCID].dischargeOk = true;
    for (const doc of Object.keys(patient.associatedDoctors)) {
      const ele = patient.associatedDoctors[doc];
      if (ele.dischargeOk === null) {
        isTotalDischarge = false;
        break;
      }
    }
    if (isTotalDischarge) patient.active = "Waiting For Discharge";
    const temp = patient.associatedDoctors[DOCID];
    temp.active[1] = "Done";
    temp["deAssigned"] = this.toDate(ctx.stub.getTxTimestamp());
    temp.note = Note;
    patient.associatedDoctors[DOCID] = temp;
    if (doctor.associatedPatients.hasOwnProperty(PID))
      delete doctor.associatedPatients[PID];
    const l = Object.keys(doctor.associatedPatients).length;
    doctor.active = ["Active", l === 0 ? "Unoccupied" : "Occupied"];
    await ctx.stub.putState(DOCID, Buffer.from(stringify(doctor)));
    await ctx.stub.putState(PID, Buffer.from(stringify(patient)));
  }

  async dischargeORCheckOutPatient(ctx, PID, timeStamp) {
    let [type, patient] = await this.getMemberType(ctx, PID);
    if (
      type !== "Admin" ||
      !JSON.parse(patient.toString())
        .orgDetails.role.toString()
        .toLowerCase()
        .includes("patient")
    )
      throw new Error("Patient can only be checked Out by an in-hospital admin");
    patient = JSON.parse(patient.toString());
    if (patient.active !== "Waiting For Discharge")
      throw new Error(
        "Patient is either not checked-In or has some doctors associated to him"
      );

    let isTotalDischarge = true;
    for (const doc of Object.keys(patient.associatedDoctors)) {
      const ele = patient.associatedDoctors[doc];
      if (ele.dischargeOk === null) {
        isTotalDischarge = false;
        break;
      }
    }
    if (!isTotalDischarge)
      throw new Error(
        "Please make sure patient has no associated doctors currently reviewing them"
      );
    patient.associatedDoctors = {};
    patient.checkOut.push(
      parseInt(timeStamp) !== 0
        ? parseInt(timeStamp)
        : this.toDate(ctx.stub.getTxTimestamp())
    );
    patient.active = this.getStatus(
      patient.checkIn,
      patient.checkOut,
      patient.associatedDoctors
    );

    await ctx.stub.putState(PID, Buffer.from(stringify(patient)));
  }
  /**
   *
   * @param {Context} ctx - Transaction
   * @param {String} PID - PatientID
   * @param {String} DID - DoctorID
   * This function assigns patient to doctor... [UPDATE]
   * USE SubmitTransaction for this rather than evaluate
   * Patients can be assigned to doctors only by admins
   */
  async assignPatientToDoctor(ctx, PID, DID) {
    let [doctype, doctor] = await this.getMemberType(ctx, DID);
    if (
      doctype !== "Admin" ||
      !JSON.parse(doctor.toString())
        .orgDetails.role.toString()
        .toLowerCase()
        .includes("doctor")
    )
      throw new Error("Patient can only be registered to an in-hospital doctor.");
    let [_, patient] = await this.getMemberType(ctx, PID);
    patient = JSON.parse(patient.toString());
    doctor = JSON.parse(doctor.toString());
    if (doctor.orgDetails.org !== patient.orgDetails.org)
      throw new Error("Patient can only be registered to in-hospital doctor.");
    if (doctor.associatedPatients[PID])
      throw new Error(
        "Requested doctor has already been assigned to this patient...Please dissolve them first then assign again for new entry or reset status altogether"
      );
    if (patient.checkIn.length === patient.checkOut.length)
      throw new Error(
        "Patient has not yet been checked-In. Please check-In the patient first"
      );
    // Update the details
    const ptObj = {
      name: `${patient.details.firstName} ${
        patient.details.middleName !== "UNDEFINED" ? patient.details.middleName : ""
      } ${patient.details.lastName}`,
      active: "Actively Watched",
      assignedOn: this.toDate(ctx.stub.getTxTimestamp()),
      dischargeOk: null
    };
    const docObj = {
      name: `${doctor.details.firstName} ${
        doctor.details.middleName !== "UNDEFINED" ? doctor.details.middleName : ""
      } ${doctor.details.lastName}`,
      department: doctor.details.department,
      assignedOn: this.toDate(ctx.stub.getTxTimestamp()),
      active: ["Verified", "In-progress"],
      note: "Patient is currently being examined",
      EMRID: -500,
      dischargeOk: null,
      email: doctor.details.email
    };
    doctor.associatedPatients[PID] = ptObj;
    doctor.active = ["Active", "Occupied"];
    patient.associatedDoctors[DID] = docObj; // Tag to recognize no record has yet been registered in the name of this patient
    patient.active = this.getStatus(
      patient.checkIn,
      patient.checkOut,
      patient.associatedDoctors
    );
    await ctx.stub.putState(DID, Buffer.from(stringify(doctor)));
    await ctx.stub.putState(PID, Buffer.from(stringify(patient)));
  }

  /**
   * @param {TxContext} ctx
   * @param {String} PID - Patient ID
   * @returns {Buffer} Patient Object
   * Utitlity/Useful function to get Patient Details from patient ID
   * USE EvaluateTransaction
   */
  async getPatientDetails(ctx, PID) {
    const [type, patient] = await this.getMemberType(ctx, PID);
    return patient.toString();
  }

  async getDataForExternal(ctx, PID, FromDOCID, UID) {
    // ERROR HERE....
    let [type, _] = await this.getMemberType(ctx, FromDOCID);
    if (type !== "Doctor") throw new Error("Invalid Host Request...");
    let patient = await ctx.stub.getState(PID);
    patient = JSON.parse(patient.toString());
    if (String(patient.secretSharingPair[FromDOCID]) !== String(UID))
      throw new Error("Make sure the patient has accepted your request...");
    console.log("CAME HERE BRUH");

    const newAssociate = {};
    for (const doc of Object.keys(patient.associatedDoctors)) {
      const doctor = JSON.parse((await ctx.stub.getState(doc)).toString());
      console.log("PID:-", PID);
      console.log("FromDOCID:-", FromDOCID);
      console.log("Sharing Pair", doctor.secretSharingPair);
      console.log("Sharing Pair PID", doctor.secretSharingPair[PID]);
      console.log("UID", UID);
      if (
        doctor.secretSharingPair.hasOwnProperty(PID) &&
        String(doctor.secretSharingPair[PID][FromDOCID]) === String(UID)
      ) {
        console.log(String(doctor.secretSharingPair[PID][FromDOCID]) === String(UID));
        newAssociate[doc] = {
          name: `${doctor.details.firstName} ${
            doctor.details.middleName !== "UNDEFINED" ? doctor.details.middleName : ""
          } ${doctor.details.lastName}`,
          department: doctor.details.department,
          assignedOn: patient.associatedDoctors[doc].assignedOn,
          deAssigned: patient.associatedDoctors[doc].deAssigned
            ? patient.associatedDoctors[doc].deAssigned
            : "null",
          EMRID: -500,
          email: doctor.details.email
        };
      }
    }
    patient.associatedDoctors = newAssociate;
    console.log(patient);
    return JSON.stringify(patient);
  }

  // TODO ::
  async getPatientRecords(ctx, PID) {
    //PHR and EMR if neccessary
    //FUNCTION ASSOCIATED TO ABOVE FUNCTION...
  }

  /**
   *
   * @param {TxContext} ctx
   * @param {String} DID - Doctor ID
   * @returns {Buffer} Doctor Object
   * function to get Patient Details from doctor ID
   * USE EvaluateTransaction
   */
  async getDoctorDetails(ctx, DID) {
    const [doctype, doctor] = await this.getMemberType(ctx, DID);
    if (doctype === "Doctor" || doctype === "Admin") return doctor.toString();
    throw new Error("Invalid Host Request...");
  }

  async getAllPatientsForDoctor(ctx, DID) {
    const [doctype, doc] = await this.getMemberType(ctx, DID);
    if (doctype !== "Doctor" && doctype !== "Admin")
      throw new Error("Invalid Host Request...");
    const ptIDs = JSON.parse(doc).associatedPatients;
    const allPatients = [];
    for (const id of ptIDs) {
      // OMITTING OrgDetails, secretShaingPair
      const { secretSharingPair, ...res } = await ctx.stub.getState(id);
      allPatients.push(JSON.parse(res));
    }
    return JSON.stringify(allPatients);
  }

  async getAllDoctorsForPatient(ctx, PID) {
    const [type, patient] = await this.getMemberType(ctx, PID);
    if (!JSON.parse(patient).orgDetails.role.toString().toLowerCase().includes("patient"))
      throw new Error("Patient Identity does not exists...");

    const docIDs = JSON.parse(patient).associatedDoctors;
    const allDoctors = [];
    await Promise.all(
      Object.keys(docIDs).map(async (key) => {
        const object = await ctx.stub.getState(key);
        // OMITTING OrgDetails, secretShaingPair Key, associatedPatients of Doctor for User other than Admin
        const { secretSharingPair, ...objAdmin } = object;
        const { associatedPatients, ...obj } = objAdmin;
        allDoctors.push(JSON.parse(type === "Admin" ? objAdmin : obj));
      })
    );
    return JSON.stringify(allDoctors);
  }

  getOrganizationDetails(ctx) {
    const cid = new ClientIdentity(ctx.stub);
    console.log(cid);
    return stringify({
      role: cid.getAttributeValue("hf.Affiliation"),
      org: cid.getMSPID()
    });
  }

  toDate(timestamp) {
    const milliseconds =
      (timestamp.seconds.low + timestamp.nanos / 1000000 / 1000) * 1000;
    return milliseconds;
  }

  getStatus(checkIn, checkOut, docs) {
    if (checkIn.length > checkOut.length) {
      if (Object.keys(docs).length === 0) return "Waiting To Be Assigned";
      for (const key of Object.keys(docs))
        if (!docs[key].dischargeOk) return "Actively Watched";
      return "Waiting For Discharge";
    }
    return "Not Patients";
  }

  async createOrgIndex(ctx, ID, orgDetails, index) {
    await ctx.stub.putState(
      await ctx.stub.createCompositeKey(index, [orgDetails, ID]),
      Buffer.from("\u0000")
    );
  }

  async acceptRequestToFromAdmin(ctx, DocID, PTID, UID, FromDOCID) {
    let [type, doc] = await this.getMemberType(ctx, DocID);
    if (type !== "Doctor")
      throw new Error("You are unauthorized to access this part of the site...");
    doc = JSON.parse(doc.toString());
    // doctor.patientID.fromExternalDoctor = Key;
    doc.secretSharingPair[PTID] = { [FromDOCID]: UID };
    await ctx.stub.putState(DocID, Buffer.from(stringify(doc)));
  }

  async acceptRequestToFromDoctors(ctx, PTID, UID, FromDOCID) {
    let [type, patient] = await this.getMemberType(ctx, PTID);
    if (type !== "Patient")
      throw new Error("You are unauthorized to access this part of the site...");
    patient = JSON.parse(patient.toString());
    // doctor.patientID.fromExternalDoctor = Key;
    patient.secretSharingPair[FromDOCID] = UID;
    await ctx.stub.putState(PTID, Buffer.from(stringify(patient)));
  }

  async helperFunctionToGetIndexedData(ctx, index, mspid) {
    let ResultsIterator = await ctx.stub.getStateByPartialCompositeKey(index, [mspid]);
    let response = await ResultsIterator.next();
    const allDataArray = [];
    while (!response.done) {
      if (!response || !response.value || !response.value.key) return;
      let attributes, _;
      ({ _, attributes } = await ctx.stub.splitCompositeKey(response.value.key));
      let returnedAssetName = attributes[1];
      const v = await ctx.stub.getState(returnedAssetName);
      allDataArray.push(JSON.parse(v.toString()));
      response = await ResultsIterator.next();
    }

    return allDataArray;
  }
  /**
   * GETS ALL THE PATIENTS IN THE CURRENT HOSPITAL CONTEXT
   * @param {TxContext} - Context
   * @param {String} - Doctor ID
   * @returns
   */
  async getAllPatients(ctx) {
    const [type, mspid] = await this.getMemberType(ctx, "0");
    if (type !== "Admin")
      throw new Error("You are unauthorized to access this part of the site...");
    return JSON.stringify(
      await this.helperFunctionToGetIndexedData(ctx, indexedOrgForPatients, mspid)
    );
  }

  async getDotorBasicDetails(ctx, docID) {
    const [type, _] = await this.getMemberType(ctx, docID);
    if (type != "Doctor")
      throw new Error("You are unauthorized to access this part of the site...");
    const doc = await ctx.stub.getState(docID);
    if (!doc || doc.length === 0) throw new Error("You have queried and empty result");
    return JSON.stringify(JSON.parse(doc.toString()));
  }

  async getPatientBasicDetails(ctx, PtID) {
    const [type, _] = await this.getMemberType(ctx, PtID);
    if (type !== "Doctor" && type !== "Patient")
      throw new Error("You are unauthorized to access this part of the site...");
    const pt = await ctx.stub.getState(PtID);
    if (!pt || pt.length === 0) throw new Error("You have queried and empty result");
    return JSON.stringify(JSON.parse(pt.toString()));
  }
  /**
   * GETS ALL THE DOCTORS IN THE CURRENT HOSPITAL CONTEXT
   * @param {TxContext} - Context
   * @param {String} - Doctor ID
   * @returns
   */
  async getAllDoctors(ctx) {
    const [type, mspid] = await this.getMemberType(ctx, "0");
    if (type !== "Admin")
      throw new Error("You are unauthorized to access this part of the site...");
    return JSON.stringify(
      await this.helperFunctionToGetIndexedData(ctx, indexedOrgForDoctors, mspid)
    );
  }

  /**
   * @param {TxContext} ctx
   * @param {String} id - Member ID
   * @returns {String} - [Admin, Patient/Doctor]
   */
  async getMemberType(ctx, id) {
    let member = await ctx.stub.getState(id);
    const cid = new ClientIdentity(ctx.stub);
    if (cid.getAttributeValue("orgAdmin")) {
      if (!member || member.length === 0) return ["Admin", cid.getMSPID()];
      else return ["Admin", member];
    }
    if (!member || member.length === 0)
      throw new Error(
        "Either the identity does not exists or you are entering an unauthorized zone."
      );
    else {
      if (cid.getAttributeValue("hf.Affiliation").toLowerCase().includes("patient"))
        if (
          cid.getAttributeValue("hf.Affiliation") === JSON.parse(member).orgDetails.role
        )
          return ["Patient", member];
        else
          throw new Error(
            "Invalid Host Identity. You are unauthorized to access this part of the site"
          );
      else return ["Doctor", member];
    }
  }

  // TODO: Policies to access are not undefined, do that
  async getHistoryForAsset(ctx, id) {
    const ResultsIterator = await ctx.stub.getHistoryForKey(id);
    let response = await ResultsIterator.next();
    const allDataArray = [];
    while (!response.done) {
      if (!response || !response.value || !response.value.key) return;
      console.info(`found state update with value: ${res.value.value.toString("utf8")}`);
      const obj = JSON.parse(res.value.value.toString("utf8"));
      allDataArray.push({ ...obj, timestamp: this.toDate(res.value.timestamp) });
      response = await ResultsIterator.next();
    }

    return JSON.stringify(allDataArray);
  }

  // TODO Check
  async getAllPatientsHistoryForAssets(ctx) {
    let ResultsIterator = await ctx.stub.getStateByPartialCompositeKey(
      indexedOrgForPatients,
      [mspid]
    );
    let response = await ResultsIterator.next();
    const allDataIDs = [];
    while (!response.done) {
      if (!response || !response.value || !response.value.key) return;
      let attributes, _;
      ({ _, attributes } = await ctx.stub.splitCompositeKey(response.value.key));
      let returnedAssetName = attributes[1];
      allDataIDs.push(returnedAssetName);
      response = await ResultsIterator.next();
    }

    let totalData = [];
    allDataIDs.forEach(async (ID) => {
      const dataC = JSON.parse(await this.getHistoryForAsset(ctx, ID));
      if (dataC) totalData.push(dataC);
    });

    return JSON.stringify(totalData);
  }

  // FROMDAY IS LESSER THAN TODAY
  async getPatientCheckInCheckOutStats(ctx, fromDayRange, toDayRange) {
    const data = JSON.parse(await this.getAllPatients(ctx));
    const returnedData = { checkedIn: 0, checkedOut: 0, Male: 0, Female: 0, Other: 0 };
    data.forEach((patient) => {
      patient.checkIn.forEach((time) => {
        if (
          parseInt(time) >= parseInt(fromDayRange) &&
          parseInt(time) <= parseInt(toDayRange)
        ) {
          returnedData.checkedIn++;
          const maleFemale =
            String(patient.details.gender)[0].toUpperCase() +
            String(patient.details.gender).slice(1).toLowerCase();
          returnedData[maleFemale]++;
        }
      });
      patient.checkOut.forEach((time) => {
        if (
          parseInt(time) >= parseInt(fromDayRange) &&
          parseInt(time) <= parseInt(toDayRange)
        )
          returnedData.checkedOut++;
      });
    });

    return JSON.stringify(returnedData);
  }

  async getPatientDataStatsTimeLine(ctx, fromDayRange, toDayRange, time) {
    console.log("Range Recieved :-", [fromDayRange, toDayRange]);
    console.log("Time Recieved :-", time);
    const data = JSON.parse(await this.getAllPatients(ctx));
    const returnedData = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];
    data.forEach((patient) => {
      console.log("Entered CheckIn");
      const checkInArray = returnedData[0];
      patient.checkIn.forEach((t) => {
        console.log(t);
        t = parseInt(t);
        const timeT = new Date(t);
        timeT.setHours(timeT.getHours() + 8);
        if (t >= parseInt(fromDayRange) && t <= parseInt(toDayRange)) {
          console.log(
            "For Time =",
            t,
            "It is in the range with hour = ",
            timeT.getHours()
          );
          const hour = timeT.getHours();
          console.log("Time Hour =", hour);
          if (time === "morning") checkInArray[hour] += 1;
          else {
            if (hour >= 13 && hour <= 23) checkInArray[hour - 11] += 1;
            else checkInArray[hour] += 1;
          }
        }
        console.log(checkInArray);
      });
      returnedData[0] = checkInArray;
      console.log("TOTOL CHECKIN DATA -", returnedData);
      const checkOutArray = returnedData[1];
      patient.checkOut.forEach((t) => {
        console.log(t);
        t = parseInt(t);
        const timeT = new Date(t);
        timeT.setHours(timeT.getHours() + 8);
        if (t >= parseInt(fromDayRange) && t <= parseInt(toDayRange)) {
          const hour = timeT.getHours();
          console.log("For Time =", t, "It is in the range with hour = ", hour);
          if (time === "morning") checkOutArray[hour] += 1;
          else {
            if (hour >= 13 && hour <= 23) checkOutArray[hour - 11] += 1;
            else checkOutArray[hour] += 1;
          }
        }
      });
      returnedData[1] = checkOutArray;
      console.log("TOTOL CHECKOUT DATA -", returnedData);
    });
    return JSON.stringify(returnedData);
  }
}
module.exports = FabCar;
