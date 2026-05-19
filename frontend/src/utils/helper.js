export const truncate = (str, max = 30) =>
  str?.length > max ? str.substring(0, max) + '...' : (str ?? '')

export const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : ''