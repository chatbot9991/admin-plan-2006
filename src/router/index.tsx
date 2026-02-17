// src/router/index.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// ایمپورت‌های اصلی
import RequireAuth from "../auth/RequireAuth";
import MainLayout from "../layouts/MainLayout";
import RouteError from "./RouteError";

// لیزی لود صفحات (Lazy Loading)
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Users = lazy(() => import("../pages/Users"));
const Settings = lazy(() => import("../pages/Settings"));
const Login = lazy(() => import("../pages/login/Login"));
const NotFound = lazy(() => import("../pages/NotFound"));

const BlogList = lazy(() => import("../pages/blog/BlogList"));
const BlogCreate = lazy(() => import("../pages/blog/BlogCreate"));
const BlogDetails = lazy(() => import("../pages/blog/BlogDetails"));
const BlogEdit = lazy(() => import("../pages/blog/BlogEdit"));

const TransactionList = lazy(
  () => import("../pages/transaction/TransactionList"),
);

const TransactionDetails = lazy(
  () => import("../pages/transaction/TransactionDetails"),
);

// اضافه کردن صفحه بلاگ لیست
const BlogCategoryList = lazy(
  () => import("../pages/blogCategory/BlogCategoryList"),
);
const BlogCategoryCreate = lazy(
  () => import("../pages/blogCategory/BlogCategoryCreate"),
);
const BlogCategoryDetails = lazy(
  () => import("../pages/blogCategory/BlogCategoryDetails"),
);
const BlogCategoryEdit = lazy(
  () => import("../pages/blogCategory/BlogCategoryEdit"),
);

const NotifyList = lazy(() => import("../pages/notify/NotifyList"));
const NotifyDetails = lazy(() => import("../pages/notify/NotifyDetails"));
const NotifyCreate = lazy(() => import("../pages/notify/NotifyCreate"));

const DiscountList = lazy(() => import("../pages/discount/DiscountList"));
const DiscountCreate = lazy(() => import("../pages/discount/DiscountCreate"));
const DiscountDetails = lazy(() => import("../pages/discount/DiscountDetails"));
const DiscountEdite = lazy(() => import("../pages/discount/DiscountEdite"));

// یک لودینگ ساده
const PageLoader = () => (
  <div
    className="d-flex align-items-center justify-content-center w-100 min-vh-50"
    style={{ height: "50vh" }}
  >
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

export const router = createBrowserRouter([
  {
    element: <RequireAuth />,
    errorElement: <RouteError />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            index: true,
            path: "dashboard",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            ),
          },
          {
            path: "users",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Users />
              </Suspense>
            ),
          },
          {
            path: "settings",
            element: (
              <Suspense fallback={<PageLoader />}>
                <Settings />
              </Suspense>
            ),
          },
          // --- بخش بلاگ ---
          {
            path: "blog",
            children: [
              {
                index: true,
                element: <Navigate to="list" replace />,
              },
              {
                path: "list",
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <BlogList />
                  </Suspense>
                ),
              },
              {
                // اصلاح شده: کلمه blog حذف شد
                path: "details/:id",
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <BlogDetails />
                  </Suspense>
                ),
              },
              {
                // اصلاح شده: کلمه blog حذف شد
                path: "edit/:id",
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <BlogEdit />
                  </Suspense>
                ),
              },
              {
                // اصلاح شده: کلمه blog حذف شد
                path: "create",
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <BlogCreate />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: "blog",
            children: [
              {
                index: true,
                element: <Navigate to="list" replace />,
              },
              {
                path: "list",
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <BlogList />
                  </Suspense>
                ),
              },
              {
                // اصلاح شده: کلمه blog حذف شد
                path: "details/:id",
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <BlogDetails />
                  </Suspense>
                ),
              },
              {
                // اصلاح شده: کلمه blog حذف شد
                path: "edit/:id",
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <BlogEdit />
                  </Suspense>
                ),
              },
              {
                // اصلاح شده: کلمه blog حذف شد
                path: "create",
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <BlogCreate />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: "blog-category",
            children: [
              {
                index: true,
                element: <Navigate to="list" replace />,
              },
              {
                path: "list",
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <BlogCategoryList />
                  </Suspense>
                ),
              },
              {
                // اصلاح شده: کلمه blog حذف شد
                path: "details/:id",
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <BlogCategoryDetails />
                  </Suspense>
                ),
              },
              {
                // اصلاح شده: کلمه blog حذف شد
                path: "edit/:id",
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <BlogCategoryEdit />
                  </Suspense>
                ),
              },
              {
                // اصلاح شده: کلمه blog حذف شد
                path: "create",
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <BlogCategoryCreate />
                  </Suspense>
                ),
              },
            ],
          },

          {
            path: "transactions",
            children: [
              {
                index: true,
                element: <Navigate to="list" replace />,
              },
              {
                path: "list",
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <TransactionList />
                  </Suspense>
                ),
              },
              {
                // اصلاح شده: کلمه blog حذف شد
                path: "details/:id",
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <TransactionDetails />
                  </Suspense>
                ),
              },

              {
                path: "details/:id",
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <TransactionDetails />
                  </Suspense>
                ),
              },
            ],
          },
          {
            path: "notifications",
            children: [
              {
                index: true,
                element: <Navigate to="list" replace />,
              },
              {
                path: "list",
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <NotifyList />
                  </Suspense>
                ),
              },
              {
                // اصلاح شده: کلمه blog حذف شد
                path: "details/:id",
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <NotifyDetails />
                  </Suspense>
                ),
              },
              {
                path: "create",
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <NotifyCreate />
                  </Suspense>
                ),
              },
            ],
          },

          {
            path: "discount",
            children: [
              {
                index: true,
                element: <Navigate to="list" replace />,
              },
              {
                path: "list",
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <DiscountList />
                  </Suspense>
                ),
              },
              {
                path: "create",
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <DiscountCreate />
                  </Suspense>
                ),
              },
              {
                path: "details/:id",
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <DiscountDetails />
                  </Suspense>
                ),
              },
              {
                path: "edit/:id",
                element: (
                  <Suspense fallback={<PageLoader />}>
                    <DiscountEdite />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },
    ],
  },

  // روت‌های عمومی
  {
    path: "/login",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFound />
      </Suspense>
    ),
  },
]);
