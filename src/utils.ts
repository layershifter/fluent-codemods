export function markFileAsChanged(state: unknown) {
  state.file.metadata = {
    ...state.file.metadata,
    didChanges: true,
  };
}

export function markFileAsContainsTodo(state: unknown) {
  state.file.metadata = {
    ...state.file.metadata,
    containsTodo: true,
  };
}
