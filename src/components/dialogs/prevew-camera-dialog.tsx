"use client"

import { PlayCircle } from "lucide-react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { useEffect } from "react"
import { api, recapi } from "@/lib/api"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { cameras } from "@/lib/recapi-client"
import { Camera } from "@/lib/recapi-types"
import { HLSPlayer } from "../hls-player"
import { env } from "process"

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
            <DialogContent className="w-full">
                <DialogHeader>
                    <DialogTitle>{serial}</DialogTitle>
                    <DialogDescription asChild>
                        <div>{streaming_status}</div>
                    </DialogDescription>
                </DialogHeader>
                <HLSPlayer src={streaming_url} />
            </DialogContent>
        </Dialog>
    )
}