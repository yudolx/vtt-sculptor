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
import type { IVTTCue } from "@sculptor/helpers/vtt";

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
  editorWrapperEl: HTMLDivElement | null = null;
  textAreaEl: HTMLTextAreaElement | null = null;

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
      if (this.editorWrapperEl) {
        const textArea = this.editorWrapperEl.querySelector("textarea");
        // TODO: Without this timeout textarea can't get into focus state because
        // something (dnd-kit) triggers the blur event right after this focus
        setTimeout(() => {
          if (textArea) {
            textArea.selectionStart = textArea.value.length;
            textArea?.focus();
          }
        }, 50);
      }
    }
  }

  handleWindowClick = (e: MouseEvent) => {
    if (
      !this.editorWrapperEl?.contains(e.target as Node) &&
      this.editorWrapperEl !== e.currentTarget
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

  private setWrapperRef = (el: HTMLDivElement | null) => {
    this.editorWrapperEl = el;

    if (this.editorWrapperEl) {
      this.textAreaEl = this.editorWrapperEl.querySelector("textarea");
    } else {
      this.textAreaEl = null;
    }
  };

  renderEdit() {
    return (
      <Box sx={{ position: "relative" }} ref={this.setWrapperRef}>
        <ButtonGroup
          size="sm"
          variant="plain"
          sx={{
            position: "absolute",
            left: "2px",
            bottom: "2px",
            borderBottom: "1px #eee solid",
          }}
        >
          <ToolboxButton
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (this.textAreaEl) {
                wrapSelectedTextInTag(this.textAreaEl, ["<b>", "</b>"]);
              }
            }}
          >
            <strong>B</strong>
          </ToolboxButton>
          <ToolboxButton
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (this.textAreaEl) {
                wrapSelectedTextInTag(this.textAreaEl, ["<i>", "</i>"]);
              }
            }}
          >
            <i>I</i>
          </ToolboxButton>
          <ToolboxButton
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (this.textAreaEl) {
                wrapSelectedTextInTag(this.textAreaEl, ["<u>", "</u>"]);
              }
            }}
          >
            <u>U</u>
          </ToolboxButton>
          <ToolboxButton
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (this.textAreaEl) {
                wrapSelectedTextInTag(this.textAreaEl, "<br />");
              }
            }}
          >
            {"<br />"}
          </ToolboxButton>
          <ToolboxButton
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (this.textAreaEl) {
                wrapSelectedTextInTag(this.textAreaEl, ["<hft>", "</hft>"]);
              }
            }}
          >
            {"<hft>"}
          </ToolboxButton>
          <ToolboxButton
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (this.textAreaEl) {
                wrapSelectedTextInTag(this.textAreaEl, ["<ol>", "</ol>"]);
              }
            }}
          >
            {"<ol>"}
          </ToolboxButton>
          <ToolboxButton
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (this.textAreaEl) {
                wrapSelectedTextInTag(this.textAreaEl, ["<ul>", "</ul>"]);
              }
            }}
          >
            {"<ul>"}
          </ToolboxButton>
          <ToolboxButton
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (this.textAreaEl) {
                wrapSelectedTextInTag(this.textAreaEl, ["<li>", "</li>"]);
              }
            }}
          >
            {"<li>"}
          </ToolboxButton>
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

const wrapSelectedTextInTag = (
  el: HTMLTextAreaElement,
  tag: string | [string, string],
) => {
  // setting the value directly (el.value) resets the undo stack for this input
  const setValue = (value: string) => {
    el.focus();
    el.select();
    document.execCommand("insertText", false, value);
  };

  const { selectionStart, selectionEnd } = el;
  const selectedText = el.value.substring(selectionStart, selectionEnd);
  const start = el.value.slice(0, selectionStart);
  const end = el.value.slice(selectionEnd);

  if (selectedText.length === 0) {
    if (typeof tag === "string") {
      setValue(`${start}${tag}${end}`);
      el.selectionStart = selectionStart + tag.length;
    } else {
      setValue(`${start}${tag[0]}${tag[1]}${end}`);
      el.selectionStart = selectionStart + tag[0].length + tag[1].length;
      el.selectionEnd = el.selectionStart;
    }
  } else {
    if (typeof tag === "string") {
      setValue(`${start}${tag}${end}`);
      el.selectionStart = selectionStart + tag.length;
      el.selectionEnd = el.selectionStart;
    } else {
      setValue(`${start}${tag[0]}${selectedText}${tag[1]}${end}`);
      el.selectionStart =
        selectionStart + tag[0].length + selectedText.length + tag[1].length;
      el.selectionEnd = el.selectionStart;
    }
  }

  return el.value;
};
