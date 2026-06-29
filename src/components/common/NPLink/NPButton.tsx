'use client'
import { Button } from "@mui/material"
import NProgress from "nprogress";
import { useRouter } from "next/navigation";

const NPButton = (props: any) => {
    const { onClick, variant = 'outlined', name = '' } = props
    const router = useRouter()

    const handleClick = () => {
        if (onClick) {
            NProgress?.start?.();
            onClick()
            router.back()
        }
    }

    return (
        <Button
            variant={variant}
            onClick={handleClick}
            sx={{
                width: '96px',
                height: '32px',
                borderRadius: ' 2px',
                border: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: 'transparent',
                color: 'rgba(255,255,255,0.7)',
                "&:hover": {
                    backgroundColor: 'transparent'
                }
            }}
        >
            {name}
        </Button >
    )
}

export default NPButton