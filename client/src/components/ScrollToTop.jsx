import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (pathname === "/" && hash === "#tools") {
      navigate("/browse-all-tools", { replace: true });
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash, navigate]);

  return null;
}
