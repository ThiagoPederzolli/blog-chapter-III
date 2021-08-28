import Link from 'next/link';

export default function Header(): JSX.Element {
  // TODO
  return (
    <header>
      <Link href="/">
        <img src="/logo.svg" alt="logo" />
      </Link>
    </header>
  );
}
