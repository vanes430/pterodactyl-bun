import { useLocation } from "react-router-dom";
import styled, { css } from "styled-components";
import tw from "twin.macro";
import ConfigureTwoFactorForm from "@/components/dashboard/forms/ConfigureTwoFactorForm";
import UpdateEmailAddressForm from "@/components/dashboard/forms/UpdateEmailAddressForm";
import UpdatePasswordForm from "@/components/dashboard/forms/UpdatePasswordForm";
import ContentBox from "@/components/elements/ContentBox";
import PageContentBlock from "@/components/elements/PageContentBlock";
import MessageBox from "@/components/MessageBox";
import { breakpoint } from "@/theme";

const Container = styled.div`
    ${tw`flex flex-wrap`};

    & > div {
        ${tw`w-full`};

        ${css`
					${breakpoint("sm")`
      width: calc(50% - 1rem);
    `}

					${breakpoint("md")`
      ${tw`w-auto flex-1`};
    `}
				`}
    }
`;

export default () => {
	const { state } = useLocation();
	const twoFactorRedirect = (state as { twoFactorRedirect?: boolean })
		?.twoFactorRedirect;

	return (
		<PageContentBlock title={"Account Overview"}>
			{twoFactorRedirect && (
				<MessageBox title={"2-Factor Required"} type={"error"}>
					Your account must have two-factor authentication enabled in order to
					continue.
				</MessageBox>
			)}

			<Container
				css={[
					tw`lg:grid lg:grid-cols-3 mb-10`,
					twoFactorRedirect ? tw`mt-4` : tw`mt-10`,
				]}
			>
				<ContentBox title={"Update Password"} showFlashes={"account:password"}>
					<UpdatePasswordForm />
				</ContentBox>
				<ContentBox
					css={tw`mt-8 sm:mt-0 sm:ml-8`}
					title={"Update Email Address"}
					showFlashes={"account:email"}
				>
					<UpdateEmailAddressForm />
				</ContentBox>
				<ContentBox
					css={tw`md:ml-8 mt-8 md:mt-0`}
					title={"Two-Step Verification"}
				>
					<ConfigureTwoFactorForm />
				</ContentBox>
			</Container>
		</PageContentBlock>
	);
};
