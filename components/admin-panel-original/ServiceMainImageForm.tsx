"use client";

import { useActionState } from "react";
import { updateServiceMainImageAction } from "@/app/actions/admin/updateServiceMainImage";

const initialState = {
  success: false,
  message: "",
};

type ServiceMainImageFormProps = {
  serviceId: string;
  serviceName: string;
  imageUrl: string | null;
};

export default function ServiceMainImageForm({
  serviceId,
  serviceName,
  imageUrl,
}: ServiceMainImageFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateServiceMainImageAction,
    initialState
  );

  return (
    <div className="admin-service-panel-inner">
      <div className="admin-service-panel-heading">
        <p>Foto principal</p>
        <span>
          Esta foto aparece como miniatura principal del servicio. La galeria
          sigue siendo solo para fotos adicionales.
        </span>
      </div>

      {imageUrl ? (
        <img
          src={imageUrl}
          alt={serviceName}
          className="admin-service-main-preview"
        />
      ) : (
        <div className="admin-service-main-empty">Sin foto principal</div>
      )}

      <form action={formAction} className="admin-service-main-form">
        <input type="hidden" name="serviceId" value={serviceId} />

        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="admin-service-file-input"
          required
        />

        {state.message ? (
          <p
            className={`admin-service-form-message ${
              state.success ? "success" : "error"
            }`}
          >
            {state.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="admin-service-primary-action"
        >
          {isPending ? "Actualizando..." : "Actualizar foto principal"}
        </button>
      </form>
    </div>
  );
}
