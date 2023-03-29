import { AuthError } from './auth';
import { RealmsBase } from './realmsbase';

describe('example:auth', () => {
  it('example:Non Async', () => {
    print('hello world');
  });
  it('example:We can register for an account and validate it', async () => {
    const realmsbase = new RealmsBase({});
    await realmsbase.connect();

    // Register a new user
    const session = await realmsbase.auth.register('ashley@gmail.com', 'myPassword123');

    // Authenticate user
    const account = await realmsbase.auth.authenticate(session.token);
    expect(account.email).toBe('ashley@gmail.com');

    // Can't register same email twice
    let thrownError: Error | null = null;
    try {
      await realmsbase.auth.register('ashley@gmail.com', 'newpassword124');
    } catch (e: any) {
      thrownError = e;
    }
    expect(thrownError?.message).toBe(AuthError.EmailAlreadyExists);

    await realmsbase.disconnect();
  });
});
