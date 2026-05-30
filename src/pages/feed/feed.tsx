// src/pages/feed/feed.tsx
import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../services/hooks';
import {
  fetchFeeds,
  selectOrders,
  selectFeedsLoading
} from '../../services/slices/feedSlice';

export const Feed: FC = () => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const isLoading = useAppSelector(selectFeedsLoading);

  useEffect(() => {
    dispatch(fetchFeeds());
  }, []);

  if (isLoading) return <Preloader />;

  return (
    <FeedUI orders={orders} handleGetFeeds={() => dispatch(fetchFeeds())} />
  );
};
