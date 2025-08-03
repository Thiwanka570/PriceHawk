"use client";
import React, { useState, FormEvent, useEffect } from "react";
import ProductCard, { Product } from "./components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";

type ProductsBySource = {
  [key: string]: Product[];
};

function groupBySource(products: Product[]): ProductsBySource {
  if (!Array.isArray(products)) return {};
  
  return products.reduce((acc: ProductsBySource, product) => {
    if (!acc[product.source]) {
      acc[product.source] = [];
    }
    acc[product.source].push(product);
    return acc;
  }, {});
}

const Home: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<ProductsBySource | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(4); // Products per page per store

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Save recent searches to localStorage
  useEffect(() => {
    if (recentSearches.length > 0) {
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }
  }, [recentSearches]);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResults(null);
    setCurrentPage(1); // Reset to first page on new search

    try {
      const res = await fetch(`http://localhost:8000/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();
      
      // Update recent searches
      if (!recentSearches.includes(query)) {
        setRecentSearches(prev => [query, ...prev].slice(0, 5));
      }

      setResults(groupBySource(data.results || data));
    } catch (error) {
      console.error("Fetch failed:", error);
      setResults({});
    } finally {
      setLoading(false);
      setShowRecentSearches(false);
    }
  }

  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
    setLoading(true);
    setResults(null);
    setCurrentPage(1);
    fetch(`http://localhost:8000/search?q=${encodeURIComponent(searchTerm)}`)
      .then(res => res.json())
      .then(data => {
        setResults(groupBySource(data.results || data));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // Pagination logic
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <>
      <Head>
        <title>PriceHawk - Compare Prices Across Stores</title>
        <meta name="description" content="Compare product prices across multiple e-commerce platforms" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 md:mb-10 text-center"
          >
            <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
              PriceHawk
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-sm md:text-base">
              Compare product prices across multiple stores in one place
            </p>
          </motion.header>

          {/* Search Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative mb-8 md:mb-12"
          >
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row justify-center gap-3 md:gap-4">
              <div className="relative flex-1 max-w-2xl">
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setShowRecentSearches(true)}
                  onBlur={() => setTimeout(() => setShowRecentSearches(false), 200)}
                  className="w-full p-3 md:p-4 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-sm md:text-base"
                />
                <button 
                  type="button" 
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 md:p-2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {/* Recent Searches Dropdown */}
                {showRecentSearches && recentSearches.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden"
                  >
                    <div className="py-1">
                      <p className="px-3 py-1 text-xs font-semibold text-slate-500">RECENT SEARCHES</p>
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleRecentSearchClick(search)}
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors text-slate-700 text-sm"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-3 md:px-8 md:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-1 md:gap-2 text-sm md:text-base"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 md:py-20"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3 md:mb-4"></div>
              <p className="text-slate-600 text-sm md:text-base">Searching across stores...</p>
            </motion.div>
          )}

          {/* Results */}
          <AnimatePresence>
            {results && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="overflow-hidden"
              >
                {Object.keys(results).length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 md:py-20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 md:h-16 md:w-16 mx-auto text-slate-400 mb-3 md:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg md:text-xl font-semibold text-slate-700 mb-1 md:mb-2">No products found</h3>
                    <p className="text-slate-500 max-w-md mx-auto text-sm md:text-base">
                      We couldn't find any products matching your search. Try different keywords.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-8 md:space-y-12"
                  >
                    {Object.entries(results).map(([source, products]) => {
                      // Calculate pagination for each store
                      const indexOfLastItem = currentPage * itemsPerPage;
                      const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                      const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);
                      const totalPages = Math.ceil(products.length / itemsPerPage);

                      return (
                        <motion.section 
                          key={source} 
                          variants={itemVariants}
                          className="bg-white rounded-xl shadow-sm p-4 md:p-6"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6">
                            <div className="flex items-center mb-2 md:mb-0">
                              <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                                {source}
                              </h2>
                              <span className="ml-2 md:ml-3 px-2 py-0.5 md:px-3 md:py-1 bg-blue-100 text-blue-800 text-xs md:text-sm font-medium rounded-full">
                                {products.length} items
                              </span>
                            </div>
                            
                            {totalPages > 1 && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                                  disabled={currentPage === 1}
                                  className="p-1 md:p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                  </svg>
                                </button>
                                
                                <span className="text-sm md:text-base text-slate-600">
                                  Page {currentPage} of {totalPages}
                                </span>
                                
                                <button
                                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                  disabled={currentPage === totalPages}
                                  className="p-1 md:p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <div className="relative">
                            <div className="overflow-x-auto pb-4">
                              <div className="flex space-x-4 md:space-x-6 w-max">
                                {currentItems.map((product, idx) => (
                                  <motion.div 
                                    key={idx}
                                    variants={itemVariants}
                                    whileHover={{ y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="w-48 md:w-56 flex-shrink-0"
                                  >
                                    <ProductCard product={product} />
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.section>
                      );
                    })}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <motion.footer 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 md:mt-20 pt-6 md:pt-8 border-t border-slate-200 text-center text-slate-500 text-xs md:text-sm"
          >
            <p>© {new Date().getFullYear()} PriceHawk - Compare prices across stores</p>
          </motion.footer>
        </div>
      </div>
    </>
  );
};

export default Home;