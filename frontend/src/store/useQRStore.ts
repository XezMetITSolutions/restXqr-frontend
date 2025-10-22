import { create } from 'zustand';

interface QRState {
  qrCodes: QRCode[];
  activeTableSession: {
    restaurantId: string;
    tableNumber: number;
    sessionId: string;
  } | null;
  
  // QR Actions
  setQRCodes: (codes: QRCode[]) => void;
  generateQRCodes: (restaurantId: string, restaurantSlug: string, tableCount: number) => QRCode[];
  activateQRCode: (id: string) => void;
  deactivateQRCode: (id: string) => void;
  
  // Session Actions
  startTableSession: (restaurantId: string, tableNumber: number) => void;
  endTableSession: () => void;
}

export const useQRStore = create<QRState>()((set, get) => ({
      qrCodes: [],
      activeTableSession: null,
      
      setQRCodes: (codes) => set({ qrCodes: codes }),
      
      generateQRCodes: (restaurantId, restaurantSlug, tableCount) => {
        const codes: QRCode[] = [];
        
        for (let i = 1; i <= tableCount; i++) {
          const code: QRCode = {
            id: `qr_${restaurantId}_table_${i}_${Date.now()}`,
            restaurantId,
            tableNumber: i,
            code: `MASAPP_${restaurantId}_T${i}`,
            url: `https://masapp.com/r/${restaurantSlug}/masa/${i}`,
            isActive: true,
            createdAt: new Date()
          };
          codes.push(code);
        }
        
        set((state) => ({
          qrCodes: [...state.qrCodes, ...codes]
        }));
        
        return codes;
      },
      
      activateQRCode: (id) => set((state) => ({
        qrCodes: state.qrCodes.map(qr => 
          qr.id === id ? { ...qr, isActive: true } : qr
        )
      })),
      
      deactivateQRCode: (id) => set((state) => ({
        qrCodes: state.qrCodes.map(qr => 
          qr.id === id ? { ...qr, isActive: false } : qr
        )
      })),
      
      startTableSession: (restaurantId, tableNumber) => {
        const sessionId = `session_${restaurantId}_${tableNumber}_${Date.now()}`;
        set({
          activeTableSession: {
            restaurantId,
            tableNumber,
            sessionId,
          }
        });
      },
      
      endTableSession: () => set({ activeTableSession: null })
}));
