import Redirect from 'umi/redirect';
import Authorized from '../../utils/Authorized';
const { AuthorizedRoute } = Authorized;

export default ({match, location: {search}}) => (
  <AuthorizedRoute
    render={() => <Redirect to={`/wtfk/mine`}/>}
    authority={['ROLE_ADMIN', 'ROLE_USER']}
    redirectPath="/passport/sign-in"
  />
)

