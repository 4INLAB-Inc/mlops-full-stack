interface Window {
  handleNodeAction?: (nodeId: string, action: 'run' | 'stop' | 'delete') => void
}
