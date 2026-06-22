"use client";

import { useActionState } from "react";
import { addServiceImageAction } from "@/app/actions/admin/addServiceImage";
import { deleteServiceImageAction } from "@/app/actions/admin/deleteServiceImage";
import { updateServiceImageOrderAction } from "@/app/actions/admin/updateServiceImageOrder";

type ServiceGalleryImage = {
  id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
};

type ServiceImageGalleryManagerProps = {
  serviceId: string;
  images: ServiceGalleryImage[];
};

const initialState = {
  success: false,
  message: "",
};

const maxGalleryImages = 5;

export default function ServiceImageGalleryManager({
  serviceId,
  images,
}: ServiceImageGalleryManagerProps) {
  const [addState, addFormAction, addPending] = useActionState(
    addServiceImageAction,
    initialState
  );
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteServiceImageAction,
    initialState
  );
  const [orderState, orderFormAction, orderPending] = useActionState(
    updateServiceImageOrderAction,
    initialState
  );
  const canAddImage = images.length < maxGalleryImages;

  const activeMessage =
    addState.message || deleteState.message || orderState.message;
  const activeSuccess = addState.message
    ? addState.success
    : deleteState.message
      ? deleteState.success
      : orderState.success;

  return (
    <div className="mt-4 rounded-2xl border border-neutral-100 bg-white p-4">
      <div className="mb-3">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#E60023]">
          Galeria
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          Hasta 5 fotos adicionales. La foto principal sigue siendo la imagen
          del servicio.
        </p>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="overflow-hidden rounded-2xl border border-neutral-100 bg-[#FFF7F9]"
            >
              <img
                src={image.image_url}
                alt="Foto adicional del servicio"
                className="h-24 w-full object-cover"
              />

              <div className="grid gap-2 p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase text-neutral-500">
                    #{index + 1}
                  </span>

                  <form action={deleteFormAction}>
                    <input type="hidden" name="imageId" value={image.id} />
                    <button
                      type="submit"
                      disabled={deletePending}
                      className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-[#E60023] ring-1 ring-[#FFD6E2] disabled:opacity-60"
                    >
                      Eliminar
                    </button>
                  </form>
                </div>

                <div className="flex gap-2">
                  <form action={orderFormAction}>
                    <input type="hidden" name="imageId" value={image.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      disabled={orderPending || index === 0}
                      className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-neutral-600 ring-1 ring-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Subir
                    </button>
                  </form>

                  <form action={orderFormAction}>
                    <input type="hidden" name="imageId" value={image.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      disabled={orderPending || index === images.length - 1}
                      className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-neutral-600 ring-1 ring-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Bajar
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-neutral-50 px-3 py-2 text-xs font-bold text-neutral-500">
          Sin fotos adicionales.
        </p>
      )}

      {canAddImage ? (
        <form action={addFormAction} className="mt-3 grid gap-2">
          <input type="hidden" name="serviceId" value={serviceId} />

          <input
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs file:mr-2 file:rounded-full file:border-0 file:bg-[#FFD6E2] file:px-3 file:py-1 file:text-[10px] file:font-black file:text-[#E60023]"
            required
          />

          <button
            type="submit"
            disabled={addPending}
            className="h-9 rounded-full bg-[#E60023] px-4 text-xs font-black text-white transition hover:bg-[#C4001D] disabled:opacity-60"
          >
            {addPending ? "Subiendo..." : "Subir foto"}
          </button>
        </form>
      ) : (
        <p className="mt-3 rounded-xl bg-[#FFD6E2] px-3 py-2 text-xs font-black text-[#E60023]">
          Limite de 5 fotos alcanzado.
        </p>
      )}

      {activeMessage ? (
        <p
          className={`mt-3 text-xs font-bold ${
            activeSuccess ? "text-green-700" : "text-[#E60023]"
          }`}
        >
          {activeMessage}
        </p>
      ) : null}
    </div>
  );
}
