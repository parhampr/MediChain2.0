import {
  Accordion,
  AccordionSummary,
  Autocomplete,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  AccordionDetails,
  Box,
} from "@mui/material";
import { Fragment, memo, useCallback, useEffect, useMemo, useState } from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import frLocale from "date-fns/locale/en-IN";
import { CollapseExpandButton } from "../common/utils/stylesFunction";
import { LoadingButton } from "@mui/lab";

export const FormTextField = ({ error, field, resetError }) => {
  const [textType, setTextType] = useState(false);
  field.fieldProps.InputProps["endAdornment"] = field.extraArgs?.endAdornment
    ? field.extraArgs?.endAdornment(textType, () => setTextType((prev) => !prev))
    : null;

  return (
    <Grid {...field.gridProps}>
      <TextField
        margin="normal"
        fullWidth
        {...field.fieldProps}
        type={field.fieldProps.type === "password" ? (textType ? "text" : "password") : field.fieldProps.type}
        error={error}
        onChange={() => (resetError ? resetError(field.uid) : null)}
      />
    </Grid>
  );
};

const FormSelectField = ({ error, field, resetError }) => {
  const query = field.extraArgs.options.dataFromQuery;
  const { data } = query ? query() : () => {};
  const [options, setOptions] = useState(query ? [] : field.extraArgs.options.defaultData);
  const [value, setValue] = useState(field.extraArgs.defaultValue);

  useEffect(() => {
    if (data) setOptions(data);
  }, [query, data]);

  return (
    <Grid {...field.gridProps}>
      <FormControl sx={{ width: "100%", mt: 2 }}>
        <InputLabel id={field.extraArgs.labelId}>{field.extraArgs.label}</InputLabel>
        <Select
          {...field.fieldProps}
          {...field.extraArgs.controlledArgs(value, (e) => {
            setValue(e.target.value);
            resetError(field.uid);
          })}
        >
          <MenuItem value={field.extraArgs.emptyValue}>
            <em>{field.extraArgs.emptySelectPlaceholder}</em>
          </MenuItem>
          {options.map((option, i) => (
            <MenuItem key={i} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText error={error}>{field.extraArgs.helperText}</FormHelperText>
      </FormControl>
    </Grid>
  );
};

const FormDatepickerField = ({ error, field, resetError }) => {
  const [value, setValue] = useState(field.extraArgs?.defaultValue ?? new Date().getTime());
  const onChangeValue = (e) => {
    setValue(e);
    resetError(field.uid);
  };

  return (
    <Grid {...field.gridProps}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
        <DatePicker
          {...field.fieldProps}
          {...field.extraArgs.controlledArgs(value, onChangeValue)}
          slots={{
            textField: (params) => (
              <TextField {...params} {...field.textFieldProps} error={error} margin="normal" fullWidth />
            ),
          }}
        />
      </LocalizationProvider>
    </Grid>
  );
};

const FormCustomAutocompleteFields = ({ errorA1, errorA2, field }) => {
  const [stateVal, setStateVal] = useState({ [field.autoFields[0].uid]: "", [field.autoFields[1].uid]: "" });
  const onChangeValueFn = (uid, value) => setStateVal((prev) => ({ ...prev, [uid]: value }));

  // TODO ERROR
  return field.autoFields.map((autoField, i) => (
    <Grid key={i} {...autoField.gridProps}>
      <Autocomplete
        key={i === 1 ? stateVal[field.autoFields[0].uid] : null}
        fullWidth
        {...autoField.fieldProps}
        options={autoField.fieldProps.options(stateVal)}
        disabled={autoField.extraArgs.disabledFn(stateVal)}
        renderInput={(params) => (
          <TextField
            {...params}
            {...autoField.textFieldProps}
            InputProps={{
              ...params.InputProps,
              ...autoField.textFieldInputProps,
            }}
          />
        )}
        onChange={autoField.extraArgs.onChange(autoField.uid, onChangeValueFn)}
      />
    </Grid>
  ));
};

const AccordionItem = ({ accordion, isOpen, onClickToggle, accordionError, error, resetError }) => (
  <Accordion
    expanded={isOpen}
    onChange={() => onClickToggle(accordion.id)}
    sx={{
      backgroundColor: "primary.sectionContainer",
      backgroundImage: "none",
      boxShadow: "none",
    }}
  >
    <AccordionSummary
      expandIcon={accordion.icon}
      aria-controls={`${accordion.id}bh-content`}
      id={`${accordion.id}bh-header`}
      sx={{
        backgroundColor: accordionError ? "error.tertiary" : "primary.secondarySectionContainer",
        borderRadius: accordion.borderRadius(isOpen),
      }}
    >
      <Typography component="small" sx={{ "& .MuiTypography-root": { color: "text.secondary" } }}>
        <b>{accordion.title}</b>
        <Typography>
          <small>{accordion.description}</small>
        </Typography>
      </Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Grid container spacing={2}>
        {accordion.fields.map((field) =>
          accordion.renderFields.includes(field.uid) ? (
            <Fragment key={field.uid}>
              {field.type === "TextField" && (
                <FormTextField field={field} error={error?.fields[field.uid]} resetError={resetError(accordion.id)} />
              )}
              {field.type === "Autocomplete" && <FormCustomAutocompleteFields field={field} />}
              {field.type === "DatePicker" && (
                <FormDatepickerField
                  field={field}
                  error={error?.fields[field.uid]}
                  resetError={resetError(accordion.id)}
                />
              )}
              {field.type === "Select" && (
                <FormSelectField field={field} error={error?.fields[field.uid]} resetError={resetError(accordion.id)} />
              )}
            </Fragment>
          ) : null
        )}
      </Grid>
    </AccordionDetails>
  </Accordion>
);

const MemoizedAccordionItem = memo(
  AccordionItem,
  (prev, next) =>
    prev.accordionError === next.accordionError && prev.isOpen === next.isOpen && prev.accordion === next.accordion
);

export const AppForm = ({
  accordions,
  errorContent,
  apiFn,
  extraContent,
  loadingButtonTitle,
  openOneAtTime = false,
  children,
}) => {
  const [activeIndex, setActiveIndex] = useState([accordions[0].id]);
  const [allOpen, setAllOpen] = useState(false);
  // ErrorContent is in the form --> accordionId : {accordionError: false, fields: [field, field ...]}
  const [errorHandler, setErrorHandler] = useState(errorContent);
  const [loading, setLoading] = useState(false);
  const accordionLength = accordions.length;

  // change UI element for all panels open
  useEffect(() => {
    setAllOpen(() => accordionLength === activeIndex.length);
  }, [activeIndex, accordionLength]);

  // Open only the errored panel and collapse others when onSubmit is clicked
  useEffect(() => {
    for (const [accordionId, content] of Object.entries(errorHandler))
      if (content.accordionError) {
        setActiveIndex(() => [accordionId]);
        break;
      }
  }, [errorHandler]);

  // Handle individual accordion clicks
  const handleAccordionClick = useCallback(
    (index) => {
      setActiveIndex((activeIndex) =>
        activeIndex.includes(index)
          ? activeIndex.filter((ele) => ele !== index)
          : openOneAtTime
          ? [index]
          : [...activeIndex, index]
      );
    },
    [openOneAtTime]
  );

  // Trigger all accordions to either collapse or open all at once
  const handleToggleAllClick = useCallback(() => {
    setActiveIndex((activeIndex) => (accordionLength === activeIndex.length ? [] : accordions.map((ele) => ele.id)));
  }, [accordionLength, accordions]);

  const accordionHeader = useMemo(
    () =>
      accordionLength > 1 && children ? (
        <Box component={"div"} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {children}
          <CollapseExpandButton tooltipTitle={"All Panels"} onClickBtn={handleToggleAllClick} expanded={allOpen} />
        </Box>
      ) : null,
    [accordionLength, allOpen, children, handleToggleAllClick]
  );

  const resetError = useCallback(
    (accordionId) => (fieldId) => {
      if (errorHandler[accordionId].accordionError === false || errorHandler[accordionId].fields[fieldId] === false)
        return;
      setErrorHandler((prev) => ({
        ...prev,
        [accordionId]: { accordionError: false, fields: { ...prev[accordionId].fields, [fieldId]: false } },
      }));
    },
    [errorHandler]
  );

  const onSubmitForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.target).entries();
    let flag = false;
    for (const [name, val] of form) {
      form[name] = val.toString().trim();
      for (const accordionContent of accordions) {
        // Check if there is a field with empty string
        if (accordionContent.requiredFields.includes(name) && val.toString().trim().length === 0) {
          setErrorHandler(() => ({
            ...errorContent,
            [accordionContent.id]: {
              accordionError: true,
              fields: { ...errorContent[accordionContent.id].fields, [name]: true },
            },
          }));
          flag = true;
          break;
        }
      }
      if (flag) break;
    }

    if (!flag && apiFn) await apiFn(form);
    setLoading(false);
  };

  return (
    <Fragment>
      {accordionHeader}
      <Box component="form" sx={{ my: 3 }} onSubmit={onSubmitForm}>
        {accordions.map((accordion) => (
          <MemoizedAccordionItem
            key={accordion.id}
            accordion={accordion}
            isOpen={activeIndex.includes(accordion.id)}
            onClickToggle={handleAccordionClick}
            accordionError={errorHandler[accordion.id].accordionError}
            error={errorHandler[accordion.id]}
            resetError={resetError}
          />
        ))}
        {extraContent}
        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          loading={loading}
          sx={{ mt: 3, fontWeight: "bolder", borderRadius: "40px !important", height: "45px" }}
        >
          {loadingButtonTitle ?? "Create"}
        </LoadingButton>
      </Box>
    </Fragment>
  );
};
