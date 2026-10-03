import { BeluIcon } from "../foundations/BeluIcon";
import type { BeluIconName } from "../foundations/icons";
import styles from "./client.module.css";

const trustItems: {
  icon: BeluIconName;
  title: string;
  body: string;
}[] = [
  {
    icon: "shield",
    title: "Beluers verificadas",
    body: "Perfiles evaluados antes de atenderte.",
  },
  {
    icon: "sparkles",
    title: "Experiencia seleccionada",
    body: "Servicios pensados para tu momento belu.",
  },
  {
    icon: "pin",
    title: "Servicio a domicilio",
    body: "Belleza experta donde tú estés.",
  },
];

export function TrustStrip() {
  return (
    <section
      className={styles.trust}
      aria-label="Beneficios de reservar con belu"
    >
      <div className={styles.trustIntro}>
        <span aria-hidden="true">✦</span>
        <p>
          Belleza con la tranquilidad
          <br />
          de estar en buenas manos.
        </p>
      </div>

      <div className={styles.trustItems}>
        {trustItems.map((item) => (
          <div className={styles.trustItem} key={item.title}>
            <span aria-hidden="true">
              <BeluIcon name={item.icon} />
            </span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
