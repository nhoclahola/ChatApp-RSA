// Kiểm tra email
export const isValidEmail = (email: string) => (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))

// Kiểm tra password
export const isValidPassword = (password: string) => password.length >= 6
