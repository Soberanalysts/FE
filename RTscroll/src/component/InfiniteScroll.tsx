import React, { useEffect, useState, useRef, useCallback } from 'react';

const NUM_OF_ITEMS_PER_PAGE = 10;

const InfiniteScroll: React.FC = () => {
    const [items, setItems] = useState<string[]>([]);
    const [start, setStart] = useState(0);
    const [loading, setLoading] = useState(false);
    const observerRef = useRef<HTMLDivElement | null>(null);
    const loadingRef = useRef(false);


    const fetchItems = async () => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);
        const end = start + NUM_OF_ITEMS_PER_PAGE;
        const res = await fetch(`http://localhost:3000/get-items?start=${start}&end=${end}`);
        const data: string[] = await res.json();
        setItems(prev => [...prev, ...data]);
        setStart(end);
        setLoading(false);
        loadingRef.current = false;
    };

    // IntersectionObserver 콜백 함수(화면에 보이는지 확인)
    // useCallback을 사용하여 의존성 배열에 있는 값이 변경될 때만 새로 생성
    const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
        const target = entries[0];
        if (target.isIntersecting && !loading) {
            fetchItems();
        } 
    }, [loading]);

    useEffect(() => { // 마지막 부분으로 왔는지 확인하도록 하는 hook
        const observer = new IntersectionObserver(handleObserver, { threshold: 1.0 });
        if (observerRef.current) observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [handleObserver]);

    useEffect(() => {
        fetchItems(); // 초기 로딩
    }, []);

    return (
        <div style={{ padding: '1rem' }}>
        <h1>무한스크롤 (React + TypeScript)</h1>

        <div>
            {items.map((item, index) => (
            <div key={index} style={{height: '50px', borderBottom: '1px solid #ddd', padding: '8px' }}>
                {item}
            </div>
            ))}
            <div ref={observerRef} style={{ height: '40px' }} />
            {loading && <p>로딩 중...</p>}
        </div>
        </div>
    );
};

export default InfiniteScroll;