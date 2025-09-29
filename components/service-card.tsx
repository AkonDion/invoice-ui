'use client';

import { Service } from '@/types/booking';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Clock, DollarSign, CheckCircle, Plus, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { formatDuration } from '@/types/booking';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  onToggle: () => void;
}

export function ServiceCard({ service, isSelected, onToggle }: ServiceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Define character limit for truncated text
  const DESCRIPTION_LIMIT = 300;
  const shouldTruncate = service.description && service.description.length > DESCRIPTION_LIMIT;
  const displayDescription = shouldTruncate && !isExpanded 
    ? service.description.substring(0, DESCRIPTION_LIMIT) + '...'
    : service.description;

  // Check if this is the "Routine System Maintenance" service for enhanced styling
  const isRoutineMaintenance = service.name.toLowerCase().includes('routine system maintenance');
  
  // Check if this service is in missing asset state
  const isMissingAsset = service.isMissingAsset || false;

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className={`
        p-4 rounded-2xl border transition-all duration-200 cursor-pointer h-full flex flex-col relative
        ${isMissingAsset
          ? isSelected
            ? 'bg-white/15 backdrop-blur-md border-white/30 shadow-lg shadow-white/10 ring-2 ring-white/20'
            : 'bg-white/8 backdrop-blur-md border-white/20 hover:bg-white/12 hover:border-white/30'
          : isRoutineMaintenance 
            ? isSelected
              ? 'bg-[#00D6AF]/20 border-[#00D6AF]/40 shadow-lg shadow-[#00D6AF]/10 ring-2 ring-[#00D6AF]/30' 
              : 'bg-white/10 backdrop-blur-md border border-[#00D6AF]/60 hover:bg-white/20 hover:border-[#00D6AF]/80 shadow-lg shadow-[#00D6AF]/25'
            : isSelected 
              ? 'bg-[#00D6AF]/20 border-[#00D6AF]/40 shadow-lg shadow-[#00D6AF]/10' 
              : 'bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 hover:border-white/30'
        }
      `}
      onClick={onToggle}
    >
      <div className="space-y-3 flex-1 flex flex-col">
        {/* Best Value Badge for Routine Maintenance */}
        {isRoutineMaintenance && !isMissingAsset && (
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#00D6AF] to-[#00D6AF]/80 backdrop-blur-md border border-[#00D6AF] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-[#00D6AF]/30">
            BEST VALUE
          </div>
        )}
        
        {/* Missing Asset Badge */}
        {isMissingAsset && (
          <div className="absolute -top-2 -right-2 bg-white/20 backdrop-blur-md border border-white/30 text-white/90 text-xs font-medium px-3 py-1 rounded-full shadow-lg shadow-white/10 flex items-center gap-1">
            MISSING ASSET
            <Popover>
              <PopoverTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                >
                  <Info className="h-3 w-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-80 p-3 bg-white/95 backdrop-blur-md border border-white/20 text-gray-800 text-sm shadow-xl"
                side="bottom"
                align="end"
              >
                <p>
                  An asset required for this service is not recorded. A temporary asset will be created, and the technician will complete the record during the appointment.
                </p>
              </PopoverContent>
            </Popover>
          </div>
        )}
        
        {/* Service Name */}
        <div className="flex items-start justify-between">
          <h4 className="font-semibold text-lg leading-tight text-white">
            {service.name}
          </h4>
          {isSelected && (
            <CheckCircle className="h-5 w-5 flex-shrink-0 ml-2 text-green-400" />
          )}
        </div>

        {/* Description */}
        {service.description && (
          <div className="flex-1">
            <p className="text-sm leading-relaxed text-white/80">
              {displayDescription}
            </p>
            {shouldTruncate && (
              <button
                onClick={handleExpandClick}
                className="flex items-center gap-1 text-xs mt-1 transition-colors text-white/60 hover:text-white/80"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    Show more
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Category */}
        {service.category && (
          <div className="text-xs px-2 py-1 rounded-full inline-block text-white/60 bg-white/10">
            {service.category}
          </div>
        )}

        {/* Price and Duration */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4 text-white/60" />
              <span className="font-medium text-white">
                ${service.price.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-white/60" />
              <span className="text-white/80">
                {formatDuration(service.duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`
            w-full mt-auto px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
            ${isRoutineMaintenance && !isMissingAsset
              ? isSelected 
                ? 'bg-[#00D6AF] hover:bg-[#00D6AF]/90 text-white border-0 shadow-lg' 
                : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/30'
              : isSelected 
                ? 'bg-[#00D6AF] hover:bg-[#00D6AF]/90 text-white border-0 shadow-lg' 
                : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/30'
            }
          `}
        >
          <div className="flex items-center justify-center">
            {isSelected ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Selected
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
