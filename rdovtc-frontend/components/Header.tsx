'use client';
import Image from 'next/image';

interface Props {
  subtitle?: string;
  username?: string;
  branch?: string | null;
}

export default function Header({ subtitle, username, branch }: Props) {
  return (
    <header className="rdovtc-header">
      {/* Logo — using a green shield emoji as placeholder; 
          replace with <Image src="/logo1.png" .../> once you copy logo1.png to /public */}
      <span style={{ fontSize: '3.5rem' }}>🛡️</span>
      <div>
        <span>RDO-VTC&apos;s STUDENTS RECORD MANAGEMENT SYSTEM</span>
        {subtitle && <small>{subtitle}</small>}
        {username && (
          <small>
            Welcome, {username}
            {branch ? ` | Principal of ${branch}` : ''}
          </small>
        )}
      </div>
    </header>
  );
}
