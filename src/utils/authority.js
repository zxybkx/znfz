
import Session from './session';
export function getAuthority() {
  const session =  Session.get();
  return session && session.roles ? session.roles.join(',') : '';
}
