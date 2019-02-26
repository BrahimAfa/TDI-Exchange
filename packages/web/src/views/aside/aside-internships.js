import React from "react";
import { Query } from "react-apollo";
import { Link } from "@reach/router";

import { INTERNSHIPS_FEED } from "../../queries";
import { InternshipAvatar } from "../../components/internship/style";
import { Container, AsideTitle, Wrapper } from "./style";
import { TextButton } from "../../components/button";
import Loader, { Wrapper as LoaderWrapper } from "../../components/loader";

const AsideLatestInternships = () => (
  <Query
    query={INTERNSHIPS_FEED}
    variables={{
      first: 4,
      orderBy: "createdAt_DESC"
    }}
    fetchPolicy="cache-and-network"
  >
    {({ data, loading }) => (
      <Wrapper>
        <AsideTitle>Latest Internships</AsideTitle>
        {loading && (
          <LoaderWrapper>
            <Loader />
          </LoaderWrapper>
        )}
        {!loading && (
          <>
            {data.internshipsFeed.items.map(item => (
              <Container key={item.id}>
                <InternshipAvatar>
                  <img src={item.avatar} alt="internship avatar" />
                </InternshipAvatar>
                <p>{item.title}</p>
              </Container>
            ))}
            <Link to="/internships">
              <TextButton small>View All</TextButton>
            </Link>
          </>
        )}
      </Wrapper>
    )}
  </Query>
);

export default AsideLatestInternships;
