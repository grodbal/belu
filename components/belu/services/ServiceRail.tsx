import { ServiceCard, type ServiceCardData } from "./ServiceCard";
import styles from "./services.module.css";

type ServiceRailProps = {
  services: ServiceCardData[];
  onSelect: () => void;
};

export function ServiceRail({ services, onSelect }: ServiceRailProps) {
  return (
    <div className={styles.rail}>
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} onSelect={onSelect} />
      ))}
    </div>
  );
}
