'use client';

import { Service } from '@/types/booking';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Clock, DollarSign, CheckCircle, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDuration } from '@/types/booking';
import { useState } from 'react';

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

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className={`
        p-4 rounded-2xl border transition-all duration-200 cursor-pointer h-full flex flex-col relative
        ${isRoutineMaintenance 
          ? isSelected
            ? 'bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/20 border-[#FFD700]/60 shadow-xl shadow-[#FFD700]/20 ring-2 ring-[#FFD700]/30' 
            : 'bg-gradient-to-br from-[#FFD700]/10 to-[#FFA500]/10 border-[#FFD700]/40 shadow-lg shadow-[#FFD700]/10 hover:bg-gradient-to-br hover:from-[#FFD700]/15 hover:to-[#FFA500]/15 hover:border-[#FFD700]/50 hover:shadow-xl hover:shadow-[#FFD700]/15'
          : isSelected 
            ? 'bg-[#00D6AF]/20 border-[#00D6AF]/40 shadow-lg shadow-[#00D6AF]/10' 
            : 'bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 hover:border-white/30'
        }
      `}
      onClick={onToggle}
    >
      <div className="space-y-3 flex-1 flex flex-col">
        {/* Best Value Badge for Routine Maintenance */}
        {isRoutineMaintenance && (
          <div className="absolute -top-2 -right-2 bg-white/20 backdrop-blur-md border border-white/30 text-white/90 text-xs font-medium px-3 py-1 rounded-full shadow-lg">
            BEST VALUE
          </div>
        )}
        
        {/* Service Name */}
        <div className="flex items-start justify-between">
          <h4 className={`font-semibold text-lg leading-tight ${isRoutineMaintenance ? 'text-[#FFD700]' : 'text-white'}`}>
            {service.name}
          </h4>
          {isSelected && (
            <CheckCircle className={`h-5 w-5 flex-shrink-0 ml-2 ${isRoutineMaintenance ? 'text-[#FFD700]' : 'text-green-400'}`} />
          )}
        </div>

        {/* Description */}
        {service.description && (
          <div className="flex-1">
            <p className="text-white/80 text-sm leading-relaxed">
              {displayDescription}
            </p>
            {shouldTruncate && (
              <button
                onClick={handleExpandClick}
                className="flex items-center gap-1 text-white/60 hover:text-white/80 text-xs mt-1 transition-colors"
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
          <div className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full inline-block">
            {service.category}
          </div>
        )}

        {/* Price and Duration */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4 text-white/60" />
              <span className="text-white font-medium">
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
            ${isRoutineMaintenance
              ? isSelected 
                ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFD700]/90 hover:to-[#FFA500]/90 text-black border-0 shadow-lg font-bold' 
                : 'bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 hover:from-[#FFD700]/30 hover:to-[#FFA500]/30 text-[#FFD700] border border-[#FFD700]/40 hover:border-[#FFD700]/60 font-semibold'
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
