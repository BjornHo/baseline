import { assert } from 'chai';
import { readFileSync } from 'fs';

const defaultCircuitEntrypoint = 'main';

export const shouldBehaveLikeZKSnarkCircuit = (provider, sourcePath) => {
  describe(`circuit: ${sourcePath}`, () => {
    let source;

    before(() => {
      source = readFileSync(sourcePath).toString();
      assert(source, 'circuit source should not be null');
      assert(source.length > 0, `circuit source not read from path ${sourcePath}`);
    });
  
    describe('compile', () => {
      let artifacts;
  
      before(async () => {
        artifacts = await provider.compile(source, defaultCircuitEntrypoint);
        assert(artifacts, 'compiled artifact not returned');
      });
  
      it('should have output the compiled circuit', async () => {
        assert(artifacts.program, 'artifact should contain the compiled circuit');
      });
  
      it('should have output the ABI of the compiled circuit', async () => {
        assert(artifacts.abi, 'artifact should contain the abi');
      });
  
      describe('trusted setup', () => {
        let setupArtifacts;
  
        before(async () => {
          setupArtifacts = await provider.setup(artifacts.program);
          assert(setupArtifacts, 'setup artifacts not returned');
        });
  
        it('should have output a unique identifier for the circuit', async () => {
          assert(setupArtifacts.identifier, 'identifier should not be null');
        });
  
        it('should have output a keypair for proving and verification', async () => {
          assert(setupArtifacts.keypair, 'keypair should not be null');
        });
  
        it('should have output the raw verifier source code', async () => {
          assert(setupArtifacts.verifierSource, 'verifier source should not be null');
        });
  
        describe('witness', () => {
          let witness;
  
          before(async () => {
            witness = await provider.computeWitness(artifacts, ['2']);
            assert(witness, 'computed witness result should not be null');
          });
  
          it('should return the computed witness', async () => {
            assert(witness.witness, 'computed value did not contain witness');
          });
  
          it('should return the circuit retval', async () => {
            assert(witness.output, 'computed value did not contain retval');
          });
  
          describe('proof', () => {
            describe('when the given witness is incorrect', () => {
              // it('should fail to generate a proof', async () => {
                // FIXME -- the below expect() syntaxs isn't working as-is
                // expect(async () => await zokrates.generateProof(
                //   artifacts.program,
                //   '~out_0 3\n~one 1\n_0 3',
                //   setupArtifacts.keypair.pk,
                // )).to.throw();
              // });
            });
  
            describe('when the given proving key is incorrect', () => {
              // it('should fail to generate a proof', async () => {
                // FIXME -- the below expect() syntaxs isn't working as-is
                // expect(async () => await zokrates.generateProof(
                //   artifacts.program,
                //   witness.witness,
                //   setupArtifacts.keypair.pk.reverse(),
                // )).to.throw();
              // });
            });
  
            describe('when the given witness and proving key are valid', () => {
              let proof;
  
              before(async () => {
                proof = await provider.generateProof(
                  artifacts.program,
                  witness.witness,
                  setupArtifacts.keypair.pk,
                );
                assert(proof, 'generated proof should not be null');
              });
  
              it('should return the generated proof', async () => {
                assert(proof.proof && Object.keys(proof.proof).length > 0, 'response did not contain proof');
              });
  
              it('should return the inputs', async () => {
                assert(proof.inputs, 'response did not contain inputs');
              });
            });
          });
        });
      });
    });
  });
};
