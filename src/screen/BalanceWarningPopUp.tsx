import ModalPopUp from "../components/ui/ModalPopUp";
import { useNavigationStore } from "../store/useNavigationStore";

const BalanceWarningPopUp = () => {
  return (
    <ModalPopUp
      title="YOU'VE RUN OUT OF MONEY"
      description="ADD MORE TO YOUR BALANCE TO CONTINUE PLAYING"
      titleSize={20}
      descriptionSize={14}
      buttons={[
        {
          label: "GO BACK TO LOBBY",
          onClick: () => {
            useNavigationStore.getState().hideOverlay();
          },
        },
      ]}
    />
  );
};

export default BalanceWarningPopUp;
