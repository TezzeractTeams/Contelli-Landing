'use client';

import Image from 'next/image';
import {
  Wrapper,
  Inner,
  LogoContainer,
  CallToActions,
  BurgerMenu,
  AuthLink,
  AuthEmail,
} from './styles';
import raft_logo from '../../../../public/svgs/raft_logo.svg';
import ic_bars from '../../../../public/svgs/ic_bars.svg';
import { GetStartedButton } from '@/components';
import ThemeToggle from '@/components/Common/ThemeToggle';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { menu } from './constants';
import { useMe } from '../../../../libs/useMe';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { claims, loading } = useMe();

  return (
    <Wrapper>
      <Inner>
        <LogoContainer>
          <Image src={raft_logo} alt="raft_logo" priority />
          <BurgerMenu onClick={() => setIsOpen(!isOpen)}>
            <motion.div
              variants={menu}
              animate={isOpen ? 'open' : 'closed'}
              initial="closed"
            ></motion.div>
            <Image src={ic_bars} alt="bars" />
          </BurgerMenu>
        </LogoContainer>
        <CallToActions className={isOpen ? 'active' : ''}>
          <ThemeToggle />
          {!loading &&
            (claims ? (
              <>
                {typeof claims.email === 'string' && (
                  <AuthEmail>{claims.email}</AuthEmail>
                )}
                <AuthLink href="/auth/logout">Logout</AuthLink>
              </>
            ) : (
              <AuthLink href="/auth/login">Login</AuthLink>
            ))}
          <GetStartedButton padding="0.5rem 0.75rem" />
        </CallToActions>
      </Inner>
    </Wrapper>
  );
};

export default Header;
