'use client';

import { Service } from '@/types/booking';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Clock, DollarSign, CheckCircle, Plus } from 'lucide-react';
import { formatDuration } from '@/types/booking';

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  onToggle: () => void;
}

export function ServiceCard({ service, isSelected, onToggle }: ServiceCardProps) {
  return (
    <div 
      className={`
        p-4 rounded-2xl border transition-all duration-200 cursor-pointer
        ${isSelected 
          ? 'bg-green-500/20 border-green-500/40 shadow-lg shadow-green-500/10' 
          : 'bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 hover:border-white/30'
        }
      `}
      onClick={onToggle}
    >
      <div className="space-y-3">
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
          <p className="text-white/80 text-sm leading-relaxed">
            {service.description}
          </p>
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
            w-full mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
            ${isSelected 
              ? 'bg-green-600 hover:bg-green-700 text-white border-0 shadow-lg' 
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
