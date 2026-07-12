import { useEffect } from 'react'

// Set the browser-tab title per page, restoring nothing on unmount since the
// next page sets its own.
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title
  }, [title])
}
