import React from "react";
import {
  Chip,
  Divider,
  Stack,
  Textarea,
  Typography,
  Box,
  styled,
  ButtonGroup,
  Button,
} from "@mui/joy";
import { IVTTCue } from "@thulean-archives/shared/vtt/vttcue";

export interface ITextAreaEditableCellProps<Field extends keyof IVTTCue> {
  cue: IVTTCue;
  edit: boolean;
  field: Field;
  onChange: (value: string, field: Field, blur: boolean) => void;
  onDoubleClick: (field: Field) => void;
}
export interface ITextAreaEditableCellState {
  value: string;
}

export class TextAreaEditableCell<
  Field extends keyof IVTTCue,
> extends React.PureComponent<
  ITextAreaEditableCellProps<Field>,
  ITextAreaEditableCellState
> {
  editorWrapper: HTMLDivElement | null = null;

  constructor(props: ITextAreaEditableCellProps<Field>) {
    super(props);

    this.state = this.getInitialState();
  }

  getInitialState(): ITextAreaEditableCellState {
    return {
      value: this.props.cue[this.props.field]?.toString() ?? "",
    };
  }

  get originalFieldValue() {
    return this.props.cue[this.props.field] as string;
  }

  componentDidUpdate(
    prevProps: Readonly<ITextAreaEditableCellProps<Field>>,
    prevState: Readonly<ITextAreaEditableCellState>,
    snapshot?: any,
  ): void {
    if (
      this.props.cue !== prevProps.cue ||
      this.props.field !== this.props.field
    ) {
      this.setState({
        value: this.getInitialState().value,
      });
    }

    if (this.props.edit !== prevProps.edit) {
      if (this.props.edit) {
        window.addEventListener("mousedown", this.handleWindowClick, true);
      } else {
        window.removeEventListener("mousedown", this.handleWindowClick, true);
      }
    }

    if (this.props.edit && this.props.edit !== prevProps.edit) {
      if (this.editorWrapper) {
        const textArea = this.editorWrapper.querySelector("textarea");
        textArea?.focus();

        // TODO: Without this timeout textarea can't get into focus state because
        // something (dnd-kit) triggers the blur event right after this focus
        setTimeout(() => {
          if (textArea) {
            textArea?.focus();
            textArea.selectionEnd = textArea.value.length;
          }
        }, 50);
      }
    }
  }

  handleWindowClick = (e: MouseEvent) => {
    if (
      !this.editorWrapper?.contains(e.target as Node) &&
      this.editorWrapper !== e.currentTarget
    ) {
      e.preventDefault();
      e.stopPropagation();
      this.setState({
        value: this.originalFieldValue,
      });
      this.props.onChange(this.originalFieldValue, this.props.field, true);
    }
  };

  handleTextAreaChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    const newValue = e.currentTarget.value;
    this.setState({
      value: newValue,
    });
  };

  submitAndBlur = () => {
    if (this.state.value !== this.originalFieldValue) {
      this.props.onChange(this.state.value, this.props.field, true);
    }
  };

  handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    event.stopPropagation();
    if (event.ctrlKey && event.key === "Enter") {
      this.submitAndBlur();
    } else if (event.key === "Escape") {
      this.setState({
        value: this.originalFieldValue,
      });
      this.props.onChange(this.originalFieldValue, this.props.field, true);
    }
  };

  handleCueTextDoubleClick = () => {
    this.props.onDoubleClick(this.props.field);
  };

  renderEdit() {
    return (
      <Box
        sx={{ position: "relative" }}
        ref={(el) => {
          this.editorWrapper = el as HTMLDivElement | null;
        }}
      >
        <ButtonGroup
          variant="plain"
          sx={{
            position: "absolute",
            left: "2px",
            bottom: "2px",
            borderBottom: "1px #eee solid",
          }}
          size="sm"
        >
          <ToolboxButton
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log(document.getSelection());
            }}
          >
            <strong>B</strong>
          </ToolboxButton>
          <ToolboxButton>
            <i>I</i>
          </ToolboxButton>
          <ToolboxButton>
            <u>U</u>
          </ToolboxButton>
          <ToolboxButton>{"<br />"}</ToolboxButton>
          <ToolboxButton>{"<hft>"}</ToolboxButton>
          <ToolboxButton>{"<ol>"}</ToolboxButton>
          <ToolboxButton>{"<ul>"}</ToolboxButton>
          <ToolboxButton>{"<li>"}</ToolboxButton>
        </ButtonGroup>
        <Textarea
          sx={{ paddingBottom: "36px" }}
          minRows={3}
          size="sm"
          value={this.state.value}
          onChange={this.handleTextAreaChange}
          onKeyDown={this.handleKeyDown}
        />
      </Box>
    );
  }

  renderCueText() {
    return <div>{this.props.cue[this.props.field]}</div>;
  }

  render() {
    const { cue } = this.props;
    return (
      <StyledTextTd onDoubleClick={this.handleCueTextDoubleClick}>
        {this.props.edit ? this.renderEdit() : this.renderCueText()}

        {cue.id ? (
          <React.Fragment>
            <Divider sx={{ margin: "5px 0" }} />
            <Stack direction="row" alignItems="center" spacing={1}>
              <Chip color="danger" size="sm" title={cue.id}>
                ID
              </Chip>
              <Typography level="body-xs">{cue.uuid}</Typography>
            </Stack>
          </React.Fragment>
        ) : null}
      </StyledTextTd>
    );
  }
}

const StyledTextTd = styled("td", { name: "TextTd" })(() => {
  return {
    whiteSpace: "pre-line",
  };
});

const ToolboxButton = styled(Button, { name: "ToolboxButton" })(() => {
  return {
    fontWeight: "normal",
  };
});
