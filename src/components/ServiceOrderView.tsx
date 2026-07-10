'use client';
import { useState, useEffect } from 'react';
import { Song, ServiceItem } from '@/types';
import { ArrowLeft, Plus, TextH, CaretUp, CaretDown, Trash, Printer, ListPlus, CalendarStar } from '@phosphor-icons/react';

const EditableCell = ({ value, onChange, placeholder, className = '' }: { value: string, onChange: (v: string) => void, placeholder?: string, className?: string }) => (
  <div className="relative w-full h-full min-h-[40px]">
    <div className={`whitespace-pre-wrap break-words invisible print:visible print:text-black min-h-[40px] px-3 py-2 ${className}`}>
      {value || placeholder || '\u00A0'}
    </div>
    <textarea 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)}
      className={`absolute top-0 left-0 w-full h-full bg-transparent border-none rounded-none px-3 py-2 outline-none resize-none overflow-hidden print:hidden focus:bg-blue-50 dark:focus:bg-blue-900/20 ${className}`}
      placeholder={placeholder}
    />
  </div>
);

interface ServiceOrderViewProps {
  songs: Song[];
  serviceItems?: ServiceItem[];
  onServiceItemsChange?: (items: ServiceItem[]) => void;
  onBack: () => void;
  onNavigateToPlanner?: () => void;
  onAddToSetlist: (songId: number) => void;
}

export default function ServiceOrderView({ songs, serviceItems, onServiceItemsChange, onBack, onNavigateToPlanner, onAddToSetlist }: ServiceOrderViewProps) {
  const [localItems, setLocalItems] = useState<ServiceItem[]>(serviceItems || []);

  useEffect(() => {
    setLocalItems(serviceItems || []);
  }, [serviceItems]);

  const updateItem = (index: number, field: keyof ServiceItem, value: any) => {
    const newItems = [...localItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setLocalItems(newItems);
    if (onServiceItemsChange) onServiceItemsChange(newItems);
  };

  const addRow = () => {
    const newItems = [...localItems, { startTime: '', endTime: '', event: '', responsible: '', content: '', isHeader: false, order: localItems.length }];
    setLocalItems(newItems);
    if (onServiceItemsChange) onServiceItemsChange(newItems);
  };

  const addHeaderRow = () => {
    const newItems = [...localItems, { startTime: '', endTime: '', event: 'New Section', responsible: '', content: '', isHeader: true, order: localItems.length }];
    setLocalItems(newItems);
    if (onServiceItemsChange) onServiceItemsChange(newItems);
  };

  const removeRow = (index: number) => {
    const newItems = localItems.filter((_, i) => i !== index);
    setLocalItems(newItems);
    if (onServiceItemsChange) onServiceItemsChange(newItems);
  };

  const moveRow = (index: number, direction: 1 | -1) => {
    if (index + direction < 0 || index + direction >= localItems.length) return;
    const newItems = [...localItems];
    const temp = newItems[index];
    newItems[index] = newItems[index + direction];
    newItems[index + direction] = temp;
    setLocalItems(newItems);
    if (onServiceItemsChange) onServiceItemsChange(newItems);
  };

  const handlePrint = () => {
    window.print();
  };

  // Format date for the header
  const getNextSunday = () => {
    const d = new Date();
    d.setDate(d.getDate() + (7 - d.getDay()) % 7);
    if (d.getDay() !== 0) d.setDate(d.getDate() + 7 - d.getDay()); // force sunday
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <main className="view-section active-view overflow-y-auto bg-gray-50 dark:bg-[#0f0f0f] pb-20 print:bg-white print:p-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 print:pt-0 print:max-w-none print:px-0">
        <button 
          onClick={onBack}
          className="svc-btn mb-6 flex items-center justify-start gap-2 text-sm text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white border-none bg-transparent p-0 print:hidden"
        >
          <ArrowLeft weight="bold" /> <span>Back to Menu</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 print:hidden">
          <div>
            <h2 className="text-3xl font-bold text-black dark:text-white flex items-center gap-3 border-none pb-0 m-0">
              <ListPlus weight="fill" className="text-blue-500" /> Order of Service
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 m-0">Plan the complete service schedule and print it.</p>
          </div>
          <div className="flex gap-2">
            {onNavigateToPlanner && (
              <button 
                onClick={onNavigateToPlanner}
                className="svc-btn px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 shadow-sm flex items-center justify-center gap-2 border-none"
              >
                <CalendarStar weight="fill" className="text-xl" /> <span>Add to Sunday Setlist</span>
              </button>
            )}
            <button 
              onClick={handlePrint}
              className="svc-btn px-6 py-3 bg-white dark:bg-[#191919] border border-gray-200 dark:border-[#333] text-black dark:text-white font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-[#222] shadow-sm flex items-center justify-center gap-2"
            >
              <Printer weight="fill" className="text-xl" /> <span>Print Table</span>
            </button>
          </div>
        </div>

        {/* Action Bar (Hidden on Print) */}
        <div className="mb-4 flex gap-2 print:hidden">
          <button onClick={addHeaderRow} className="svc-btn text-sm px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-black dark:text-white rounded-lg flex items-center gap-2 border-none font-medium">
            <TextH weight="bold" /> Add Section Header
          </button>
          <button onClick={addRow} className="svc-btn text-sm px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 border-none font-medium shadow-md">
            <Plus weight="bold" /> Add Row
          </button>
        </div>

        {/* Printable Table Section */}
        <div className="bg-white print:shadow-none print:border-none print:rounded-none rounded-xl border border-gray-200 dark:border-[#333] dark:bg-[#191919] shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse print:text-black">
            <thead>
              <tr>
                <th colSpan={6} className="px-4 py-2 text-center font-bold text-lg border border-gray-300 dark:border-[#444] print:border-black print:text-black">
                  {getNextSunday()}
                </th>
              </tr>
              <tr className="bg-gray-50 dark:bg-[#222] print:bg-white text-black dark:text-gray-300 print:text-black">
                <th className="px-4 py-2 border border-gray-300 dark:border-[#444] print:border-black w-24">Time</th>
                <th className="px-4 py-2 border border-gray-300 dark:border-[#444] print:border-black w-24">Time</th>
                <th className="px-4 py-2 border border-gray-300 dark:border-[#444] print:border-black w-1/4">Event</th>
                <th className="px-4 py-2 border border-gray-300 dark:border-[#444] print:border-black w-1/5">Responsible</th>
                <th className="px-4 py-2 border border-gray-300 dark:border-[#444] print:border-black">Content</th>
                <th className="px-2 py-2 border border-gray-300 dark:border-[#444] print:hidden w-20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {localItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 print:hidden">
                    No items in the order of service. Click "Add Row" to start planning.
                  </td>
                </tr>
              ) : (
                localItems.map((item, idx) => (
                  <tr key={idx} className={`${item.isHeader ? 'bg-gray-100 dark:bg-[#2a2a2a] print:bg-gray-100 font-bold' : 'hover:bg-gray-50 dark:hover:bg-[#222] print:bg-white'}`}>
                    {item.isHeader ? (
                      <>
                        <td colSpan={5} className="border border-gray-300 dark:border-[#444] print:border-black p-0 text-center bg-transparent relative">
                          <EditableCell
                            value={item.event}
                            onChange={(v) => updateItem(idx, 'event', v)}
                            placeholder="Section Name (e.g. Sunday School)"
                            className="font-bold text-center text-base text-black dark:text-white"
                          />
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="border border-gray-300 dark:border-[#444] print:border-black p-0 relative align-top">
                          <EditableCell
                            value={item.startTime || ''}
                            onChange={(v) => updateItem(idx, 'startTime', v)}
                            placeholder="7:00 AM"
                            className="text-black dark:text-white text-center"
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-[#444] print:border-black p-0 relative align-top">
                          <EditableCell
                            value={item.endTime || ''}
                            onChange={(v) => updateItem(idx, 'endTime', v)}
                            placeholder="7:05 AM"
                            className="text-black dark:text-white text-center"
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-[#444] print:border-black p-0 relative align-top">
                          <EditableCell
                            value={item.event || ''}
                            onChange={(v) => updateItem(idx, 'event', v)}
                            placeholder="Welcome"
                            className="font-medium text-black dark:text-white"
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-[#444] print:border-black p-0 relative align-top">
                          <EditableCell
                            value={item.responsible || ''}
                            onChange={(v) => updateItem(idx, 'responsible', v)}
                            placeholder="John Doe"
                            className="text-gray-700 dark:text-gray-300 print:text-black"
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-[#444] print:border-black p-0 relative align-top">
                          <EditableCell
                            value={item.content || ''}
                            onChange={(v) => updateItem(idx, 'content', v)}
                            placeholder="Notes or lyrics..."
                            className="text-gray-700 dark:text-gray-300 print:text-black leading-relaxed"
                          />
                        </td>
                      </>
                    )}

                    {/* Move/Delete Actions */}
                    <td className="border border-gray-300 dark:border-[#444] print:hidden p-0">
                      <div className="flex items-center justify-center h-full min-h-[40px] gap-2 px-1">
                        <div className="flex flex-col justify-center">
                          <button onClick={() => moveRow(idx, -1)} disabled={idx === 0} className="text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-30 p-0.5 leading-none">
                            <CaretUp weight="bold" />
                          </button>
                          <button onClick={() => moveRow(idx, 1)} disabled={idx === localItems.length - 1} className="text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-30 p-0.5 leading-none">
                            <CaretDown weight="bold" />
                          </button>
                        </div>
                        <button onClick={() => removeRow(idx)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                          <Trash weight="bold" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
