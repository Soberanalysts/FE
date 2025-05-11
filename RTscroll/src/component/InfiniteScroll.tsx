import React, { useEffect, useState, useRef, useCallback } from 'react';

const NUM_OF_ITEMS_PER_PAGE = 10;

interface ExchangeData {
    source_currency_code: string;
    target_currency_code: string;
    fx_rate: number;
    date: string;
}
const InfiniteScroll: React.FC = () => {
    const [items, setItems] = useState<string[]>([]);
    const [exchangedData, setExchangedData] = useState<ExchangeData[]>([]);
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
        const data: { items: string[]; exchangeData: ExchangeData[] } = await res.json();
        console.log(data);
        setItems(prev => [...prev, ...data.items]);
        setExchangedData(prev => [...prev, ...data.exchangeData])
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
            {/* {items.map((item, index) => (
            <div key={index} 
                onClick={async () => {
                    const res = await fetch("http://localhost:5000/summarize", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: item }),
                    });
                    const data = await res.json();
                    alert("요약 결과: " + data.summary);
                }}
                style={{height: '100px', borderBottom: '1px solid #ddd', padding: '8px' }}>
                {item}
            </div>
            ))}
            {exchangedData.map((item, index) => (
            <div key={index} style={{height: '100px', borderBottom: '1px solid #ddd', padding: '8px' }}>
                    <div>통화: {item.source_currency_code} → {item.target_currency_code}</div>
                    <div>환율: {item.fx_rate}</div>
                    <div>날짜: {item.date}</div>
            </div>
            ))} */}
            {items.map((item, index) => (
            <div key={index} 
                onClick={async () => {
                    const res = await fetch("http://localhost:5000/summarize", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: item }),
                    });
                    const data = await res.json();
                    alert("요약 결과: " + data.summary);
                }}
                style={{ borderBottom: '1px solid #ddd', padding: '16px' }}>
                <div>{item}</div>
                {exchangedData[index] && (
                <div>
                    <div>통화: {exchangedData[index].source_currency_code} → {exchangedData[index].target_currency_code}</div>
                    <div>환율: {exchangedData[index].fx_rate}</div>
                    <div>날짜: {exchangedData[index].date}</div>
                </div>
                )}
            </div>
            ))}
            {/* 로딩 중일 때 보여줄 요소 */}
            <div ref={observerRef} style={{ height: '40px' }} />
            {loading && <p>로딩 중...</p>}
        </div>
        </div>
    );
};

export default InfiniteScroll;