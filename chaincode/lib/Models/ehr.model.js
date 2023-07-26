"use strict";
const { obtainDetails } = require("./utilities.model.js");
function prettyJSONString(inputString) {
  return JSON.stringify(JSON.parse(inputString), null, 2);
}
const getTypeEHROrDoctor = (details, orgDetails, address, contact, type) => {
  let extraAttr;
  if (type === "Doctor") {
    extraAttr = {
      associatedPatients: {}
    };
  } else {
    extraAttr = {
      PHRID: null,
      associatedDoctors: {}
    };
  }
  const content = {
    ...extraAttr,
    secretSharingPair: {},
    ...obtainDetails(
      details["passport"],
      details["firstName"],
      details["middleName"],
      details["lastName"],
      details["email"],
      details["DOB"],
      details["gender"],
      details["maritalStatus"],
      address["street1"],
      address["street2"],
      address["postcode"],
      address["country"],
      address["state"],
      address["city"],
      orgDetails.org,
      orgDetails.role,
      contact.mobile,
      contact.other,
      contact.whatsapp
    )
  };
  if (type === "Doctor") content.details["department"] = details["department"];
  return content;
};

module.exports = { getTypeEHROrDoctor };

console.log(
  prettyJSONString(
    JSON.stringify(
      getTypeEHROrDoctor(
        {
          passport: "AH4227964",
          firstName: "Kamal",
          middleName: " Kumar",
          lastName: "Khatri",
          gender: "Male",
          email: "kamal20012011@hotmail.com",
          maritalStatus: "married",
          DOB: "06/23/2001"
        },
        {
          org: "UMMC",
          role: "Patient"
        },
        {
          street1: "sdf",
          street2: "wer",
          postcode: null,
          city: "Salalah",
          state: null,
          country: "Oman"
        },
        {
          mobile: "+96894637602",
          other: null,
          whatsapp: null
        },
        "Patient"
      )
    )
  )
);
