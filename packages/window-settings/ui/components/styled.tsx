import { FormControl, FormLabel, styled } from "@mui/joy";

export const StyledFormControl = styled(FormControl, {
  name: "StyledFormControl",
})(() => {
  return {
    padding: "10px 20px",
    backgroundColor: "#fff",
    "&:first-of-type": {
      paddingTop: "20px",
    },
    "&:last-of-type": {
      paddingBottom: "20px",
    },
    "&:nth-of-type(even)": {
      backgroundColor: "rgb(248, 248, 248)",
    },
  };
});

export const StyledFormLabel = styled(FormLabel, { name: "StyledFormLabel" })(
  () => {
    return {
      fontSize: "1rem",
      fontWeight: "normal",
    };
  },
);
