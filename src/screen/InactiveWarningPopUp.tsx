import ModalPopUp from "../components/ui/ModalPopUp";
import { useNavigationStore } from "../store/useNavigationStore";

const InactiveWarningPopUp = () => {
  return (
    <ModalPopUp
      title="ARE YOU STILL THERE?"
      description="GAME PAUSED DUE TO INACTIVITY"
      titleSize={20}
      descriptionSize={14}
      buttons={[
        {
          label: "CONTINUE PLAYING",
          onClick: () => {
            useNavigationStore.getState().hideOverlay();
          },
        },
      ]}
    />
  );
};

export default InactiveWarningPopUp;
