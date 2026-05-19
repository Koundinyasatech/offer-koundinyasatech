export const validateLogin = ({ Userid, code }) => {
  const e = {}
  if (!Userid?.trim()) e.Userid = 'User ID is required'
  if (!code?.trim())   e.code   = 'Code is required'
  return e
}

export const validateEmployee = (data) => {
  const e = {}
  if (!data.empId?.trim())       e.empId       = 'Employee ID is required'
  else if (!/^\d{6}$/.test(data.empId)) e.empId = 'Enter a valid 6-digit employee Id'
  if (!data.name?.trim())        e.name        = 'Name is required'
  if (!data.designation?.trim()) e.designation = 'Designation is required'
  if (!data.mobile?.trim())      e.mobile      = 'Mobile is required'
  else if (!/^\d{10}$/.test(data.mobile)) e.mobile = 'Enter a valid 10-digit mobile'
  if (!data.email?.trim())       e.email       = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'Enter a valid email'
  return e
}

export const hasErrors = (e) => Object.keys(e).length > 0