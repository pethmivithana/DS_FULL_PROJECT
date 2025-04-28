import Link from 'next/link';
import { useRouter } from 'next/router';

const AdminLayout = ({ children }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin" className="text-xl font-bold text-gray-800">
                Admin Panel
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  router.pathname === '/admin' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/menu-items"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  router.pathname.startsWith('/admin/menu-items') ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Menu Items
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;