import Redirect from 'umi/redirect';
import Authorized from '../utils/Authorized';
import {PROVENCE_CODE} from '../constant';
const { AuthorizedRoute } = Authorized;

export default () => (
  <AuthorizedRoute
    render={() => 
    <Redirect to={ PROVENCE_CODE === '330' ?
     '/workplace' : '/workplace/light'}/>}
    authority={['ROLE_ADMIN', 'ROLE_USER']}
    redirectPath="/passport/sign-in"
  />
)

