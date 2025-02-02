import { Button, Card, Form, Input } from 'antd';
import { auth } from '../lib/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

const AuthGate = () => {
  const onFinish = async ({ email, password }) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Card title="Login Required" style={{ width: 300, margin: '100px auto' }}>
      <Form onFinish={onFinish}>
        <Form.Item name="email" rules={[{ required: true }]}>
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item name="password" rules={[{ required: true }]}>
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Sign In
        </Button>
      </Form>
    </Card>
  );
};

export default AuthGate; 