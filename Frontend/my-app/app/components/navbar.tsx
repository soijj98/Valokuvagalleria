import Link from "next/link";

export default function Navbar() {

    return (
    <nav className="flex gap-4 p-4 bg-gray-100 text-black">
      <Link href="/">Etusivu</Link>
      <Link href="/login">Kirjaudu</Link>
      <Link href="/register">Luo tunnus</Link>
    </nav>
  );

}