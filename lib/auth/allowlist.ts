export const ALLOWED_EMAILS: string[] = [
  'christianbarnard00@gmail.com',
  'charlespackard11@gmail.com',
  'ianmurray2019@gmail.com'
];

export function isEmailAllowed(email: string): boolean {
  return ALLOWED_EMAILS.includes(email.toLowerCase());
}
