"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, ArrowDownUp } from "lucide-react";
import type { Service } from "@/data/services";
import { categories } from "@/data/services";
import { ServiceCard } from "@/components/service-card";

export function ServicesBrowser({ services }: { services: Service[] }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "All services");
  const [sort, setSort] = useState(params.get("sort") ?? "recommended");
  useEffect(() => {
    const next = new URLSearchParams();
    if (query.trim()) next.set("q", query.trim());
    if (category !== "All services") next.set("category", category);
    if (sort !== "recommended") next.set("sort", sort);
    const suffix = next.toString();
    router.replace(suffix ? `${pathname}?${suffix}` : pathname, { scroll: false });
  }, [category, pathname, query, router, sort]);
  const visible = useMemo(() => {
    const result = services.filter((service) => service.status === "active" && service.serviceName.toLowerCase().includes(query.toLowerCase()) && (category === "All services" || service.category === category));
    if (sort === "price-low") result.sort((a, b) => a.price - b.price);
    if (sort === "price-high") result.sort((a, b) => b.price - a.price);
    return result;
  }, [services, query, category, sort]);
  return <section className="browser-wrap section-wrap"><div className="browser-toolbar"><div className="search-field"><Search size={17}/><input aria-label="Search services" placeholder="Search a service..." value={query} onChange={(event) => setQuery(event.target.value)}/><span>⌘ K</span></div><label className="sort-select"><ArrowDownUp size={15}/><span>Sort by</span><select aria-label="Sort services" value={sort} onChange={(event) => setSort(event.target.value)}><option value="recommended">Recommended</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div><div className="browser-layout"><aside className="category-filter"><div className="filter-title"><SlidersHorizontal size={16}/> Categories</div>{categories.map((item) => <button key={item} className={category === item ? "filter-option active" : "filter-option"} onClick={() => setCategory(item)}>{item}<span>{item === "All services" ? services.length : services.filter((service) => service.category === item).length}</span></button>)}</aside><div className="browser-results"><div className="results-caption"><span><strong>{visible.length}</strong> services to explore</span><span>Thoughtful care, picked for you</span></div>{visible.length ? <div className="service-grid">{visible.map((service, i) => <ServiceCard key={service._id} service={service} index={i}/>)}</div> : <div className="empty-results"><div>✳</div><h2>No services found just yet</h2><p>Try another search or category to find your feel-good.</p><button className="text-link" onClick={() => { setQuery(""); setCategory("All services"); }}>Clear filters</button></div>}</div></div></section>;
}
