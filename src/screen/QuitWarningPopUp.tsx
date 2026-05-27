import ModalPopUp from "../components/ui/ModalPopUp";
import { useNavigationStore } from "../store/useNavigationStore";

const QuitWarningPopUp = () => {
  return (
    <ModalPopUp
      title="ARE YOU SURE YOU WANT TO QUIT?"
      description="ALL CHIPS ON THE TABLE WILL BE CLEARED"
      titleSize={20}
      descriptionSize={14}
      buttons={[
        {
          label: "No",
          onClick: () => {
            useNavigationStore.getState().hideOverlay();
          },
        },
        {
          label: "Yes, back to lobby",
          onClick: () => {
            useNavigationStore.getState().setScreen("game");
            useNavigationStore.getState().hideOverlay();
          },
        },
      ]}
    />
  );
};

export default QuitWarningPopUp;
