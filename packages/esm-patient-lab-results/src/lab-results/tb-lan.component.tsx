import { Button } from '@carbon/react';
import React from 'react';
import styles from './widget.scss';
// import { useObservations } from './widget-hooks';

const TbLan: React.FC = () => {
  // const { isLoading, error, observations, mutate } = useObservations('patientUuid', 'observationUuid');

  // return (
  //   <div className={styles.widget}>
  //     <div className={styles.widgetHeader}>
  //       <span className={styles.title}>TB LAM</span>
  //       <span className={styles.label}>data na analise</span>
  //       <Button kind="ghost" size="sm">
  //         Histórico
  //       </Button>
  //     </div>
  //     <div className={styles.widgetBody}>
  //       <div>
  //         <div className={styles.label}>laLabel</div>
  //         <div className={styles.result}>Data</div>
  //       </div>
  //       <div>
  //         <div className={styles.label}>laLabel</div>
  //         <div className={styles.result}>Data</div>
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <div className={styles.widgetNotFound}>
      <div className={styles.widgetHeader}>
        <span className={styles.title}>TB LAM</span>
        <span className={styles.label}>Nenhum dado foi registado para este utente</span>
      </div>
    </div>
  );
};
export default TbLan;
