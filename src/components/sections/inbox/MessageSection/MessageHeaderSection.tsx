import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ClientType } from '@/types/client';
import { PhoneIcon, UserIcon, VideoIcon } from 'lucide-react';
import { MoreHorizontalIcon } from 'lucide-react';
import React from 'react'

const MessageHeaderSection = ({client}: {client: ClientType}) => {
  return (
    <header className="flex items-center justify-between p-6 bg-white border-b" style={{ minHeight: 97 }}>
      <div className="flex items-center">
        {client?.profile_image_url && (
          <Avatar className="w-12 h-12">
            <img className="w-full h-full object-cover" alt="Profile" src={client?.profile_image_url || "https://c.animaapp.com/mbtb1be13lPm2M/img/frame-2.svg"} />
          </Avatar>
        )}

        {!client?.profile_image_url && (
          <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full">
            <UserIcon className="w-6 h-6 text-white" />
          </div>
        )}
        <div className="ml-4">
          <h2 className="font-bold text-xl text-gray-900">{client?.full_name}</h2>
          <p className="text-sm text-gray-500 -mt-1">{client?.email}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon" className="h-10 w-8" aria-label="Voice call">
          <PhoneIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-[34px]" aria-label="Video call">
          <VideoIcon className="h-4 w-[18px]" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-8" aria-label="More options">
          <MoreHorizontalIcon className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

export default MessageHeaderSection