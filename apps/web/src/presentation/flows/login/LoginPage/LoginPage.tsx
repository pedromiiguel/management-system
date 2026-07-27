import { useLoginPageModel } from './LoginPage.model';
import { LoginPageView } from './LoginPage.view';

export function LoginPage() {
  const { register, errors, onSubmit, submitting, loginError } = useLoginPageModel();

  return (
    <LoginPageView
      register={register}
      errors={errors}
      onSubmit={onSubmit}
      submitting={submitting}
      loginError={loginError}
    />
  );
}
