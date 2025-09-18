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

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className={`
        p-4 rounded-2xl border transition-all duration-200 cursor-pointer h-full flex flex-col
        ${isSelected 
          ? 'bg-[#00D6AF]/20 border-[#00D6AF]/40 shadow-lg shadow-[#00D6AF]/10' 
          : 'bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 hover:border-white/30'
        }
      `}
      onClick={onToggle}
    >
      <div className="space-y-3 flex-1 flex flex-col">
        {/* Service Name */}
        <div className="flex items-start justify-between">
          <h4 className="font-semibold text-white text-lg leading-tight">
            {service.name}
          </h4>
          {isSelected && (
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 ml-2" />
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
            ${isSelected 
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
