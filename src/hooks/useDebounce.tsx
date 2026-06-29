
import { useRef } from 'react';

function debounce(fn: any, delay: any) {
    let timeoutId: any;
    return function (...args: any) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(...args);
        }, delay);
    };
}


function useDebounceFn(fn: any, delay: any) {
    const fnRef = useRef(fn);
    fnRef.current = fn;

    const debouncedFn = useRef(
        debounce((...args: any) => {
            fnRef.current(...args);
        }, delay)
    );

    return { run: debouncedFn.current };
}

export default useDebounceFn;
