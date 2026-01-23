"use client"

import { PlayCircle } from "lucide-react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { HLSPlayer } from "../hls-player"

interface PreviewCameraDialogProps {
    cameraId:number;
    serial:string;
    streaming_status?:string;
    streaming_url:string
    disabled:boolean;
}

export default function PreviewCameraDialog({cameraId, disabled, streaming_status, streaming_url, serial}:PreviewCameraDialogProps){

    return (
        <Dialog key={cameraId}>
            <DialogTrigger asChild>
                <Button variant={"ghost"} className="cursor-pointer" disabled={disabled}>
                <PlayCircle className="size-4" />
                <span className="sr-only">Ver video ao vivo</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw]! w-[90vw] h-[90vh] flex flex-col overflow-hidden">
                <DialogHeader className="shrink-0">
                    <DialogTitle>{serial}</DialogTitle>
                    <DialogDescription asChild>
                        <div>{streaming_status}</div>
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 min-h-0 overflow-hidden">
                    <HLSPlayer src={streaming_url} className="w-full h-full object-fill" />
                </div>
            </DialogContent>
        </Dialog>
    )
}