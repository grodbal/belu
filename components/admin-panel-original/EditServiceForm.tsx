"use client";

import { useActionState } from "react";
import { updateServiceAction } from "@/app/actions/admin/updateService";

const initialState = {
  success: false,
  message: "",
};

type EditServiceFormProps = {
  serviceId: string;
  category: "lashes" | "nails";
  name: string;
  description: string;
  publicPrice: number;
  logisticFee: number;
  durationMinutes: number;
  isFeatured: boolean;
};

export default function EditServiceForm({
  serviceId,
  category,
  name,
  description,
  publicPrice,
  logisticFee,
  durationMinutes,
  isFeatured,
}: EditServiceFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateServiceAction,
    initialState
  );

  return (
    <form action={formAction} className="admin-service-panel-form">
      <input type="hidden" name="serviceId" value={serviceId} />

      <label>
        Nombre
        <input name="name" defaultValue={name} required />
      </label>

      <label>
        Categoria
        <select name="category" defaultValue={category} required>
          <option value="lashes">Lashes</option>
          <option value="nails">Nails</option>
        </select>
      </label>

      <div className="admin-service-panel-form-grid">
        <label>
          Precio publico
          <input
            name="publicPrice"
            type="number"
            min="0"
            step="0.01"
            defaultValue={publicPrice}
            required
          />
        </label>

        <label>
          Cargo logistico
          <input
            name="logisticFee"
            type="number"
            min="0"
            step="0.01"
            defaultValue={logisticFee}
            required
          />
        </label>
      </div>

      <label>
        Duracion en minutos
        <input
          name="durationMinutes"
          type="number"
          min="1"
          defaultValue={durationMinutes}
          required
        />
      </label>

      <label>
        Descripcion
        <textarea name="description" defaultValue={description} />
      </label>

      <label className="admin-service-featured-control">
        <input
          type="checkbox"
          name="isFeatured"
          value="true"
          defaultChecked={isFeatured}
        />
        <span>
          <strong>Servicio destacado ✦</strong>
          <small>Los destacados aparecen primero en Nueva Reserva.</small>
        </span>
      </label>

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
        {isPending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
