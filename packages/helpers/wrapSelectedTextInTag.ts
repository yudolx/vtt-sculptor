export const wrapSelectedTextInTag = (
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
      el.selectionEnd = el.selectionStart;
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
